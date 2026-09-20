/**
 * @file agendamentoController.ts
 * @description Controlador responsável por gerenciar as regras de negócio dos agendamentos,
 * incluindo validações de prazos, sugestões de mesma semana e relatórios gerenciais.
 */

import { Request, Response } from "express";
import { openDatabase } from "../database";

/**
 * Realiza o login permitindo usuário ou e-mail juntamente com a senha.
 */
export async function fazerLogin(req: Request, res: Response) {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ erro: "Informe o usuário/e-mail e a senha." });
  }

  try {
    const db = await openDatabase();
    
    // Consulta permitindo login por email ou nome_usuario
    const usuario = await db.get(
      `SELECT * FROM usuarios WHERE (email = ? OR nome_usuario = ?) AND senha = ?`,
      [login, login, senha]
    );

    if (!usuario) {
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    return res.json({
      mensagem: "Login realizado com sucesso!",
      usuario: {
        id: usuario.id,
        nome_usuario: usuario.nome_usuario,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

/**
 * Função utilitária para calcular o início e o fim da semana de uma data dada,
 * utilizada para a regra de negócio de sugestão de agendamento na mesma semana.
 */
function getWeekRange(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDay();

  // Início da semana (Domingo)
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);

  // Fim da semana (Sábado)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

/**
 * Lista todos os serviços disponíveis no salão.
 */
export async function listarServicos(req: Request, res: Response) {
  try {
    const db = await openDatabase();
    const servicos = await db.all(`SELECT * FROM servicos`);
    return res.json(servicos);
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    return res.status(500).json({ erro: "Erro interno ao buscar serviços." });
  }
}

/**
 * Cria um novo agendamento, validando se já existe agendamento para o cliente
 * na mesma semana para sugerir a mesma data.
 */
export async function criarAgendamento(req: Request, res: Response) {
  const { nome_cliente, telefone_cliente, servicos_ids, data_agendamento } =
    req.body;

  if (
    !nome_cliente ||
    !telefone_cliente ||
    !servicos_ids ||
    !servicos_ids.length ||
    !data_agendamento
  ) {
    return res
      .status(400)
      .json({
        erro: "Preencha todos os campos obrigatórios e selecione ao menos um serviço.",
      });
  }

  try {
    const db = await openDatabase();

    // Regra: Identificar se já existe agendamento do mesmo cliente na mesma semana
    const { startOfWeek, endOfWeek } = getWeekRange(data_agendamento);

    const agendamentoExistente = await db.get(
      `SELECT * FROM agendamentos 
       WHERE telefone_cliente = ? 
       AND status != 'Cancelado'
       AND datetime(data_agendamento) BETWEEN datetime(?) AND datetime(?)`,
      [telefone_cliente, startOfWeek.toISOString(), endOfWeek.toISOString()],
    );

    let sugestaoData = null;
    if (agendamentoExistente) {
      sugestaoData = agendamentoExistente.data_agendamento;
      // Se houver agendamento na semana e a data informada for diferente, avisamos na resposta
      if (sugestaoData.slice(0, 10) !== data_agendamento.slice(0, 10)) {
        return res.status(200).json({
          aviso:
            "Identificamos outro agendamento para este cliente na mesma semana.",
          sugestao_data_original: sugestaoData,
          mensagem:
            "A Leila sugere que os serviços sejam agendados na mesma data do primeiro atendimento da semana.",
        });
      }
    }

    // Inserção do Agendamento
    const resultado = await db.run(
      `INSERT INTO agendamentos (nome_cliente, telefone_cliente, data_agendamento, status) VALUES (?, ?, ?, 'Pendente')`,
      [nome_cliente, telefone_cliente, data_agendamento],
    );

    const agendamentoId = resultado.lastID;

    // Inserir os serviços associados
    for (const servicoId of servicos_ids) {
      await db.run(
        `INSERT INTO agendamento_itens (agendamento_id, servico_id) VALUES (?, ?)`,
        [agendamentoId, servicoId],
      );
    }

    return res.status(201).json({
      mensagem: "Agendamento realizado com sucesso!",
      id: agendamentoId,
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return res.status(500).json({ erro: "Erro interno ao criar agendamento." });
  }
}

/**
 * Lista todos os agendamentos ou filtra por período/cliente (histórico e painel operacional).
 */
export async function listarAgendamentos(req: Request, res: Response) {
  try {
    const { data_inicio, data_fim, telefone } = req.query;
    const db = await openDatabase();

    let query = `
      SELECT a.*, 
             GROUP_CONCAT(s.nome, ', ') as servicos_nomes,
             SUM(s.preco) as valor_total
      FROM agendamentos a
      LEFT JOIN agendamento_itens ai ON a.id = ai.agendamento_id
      LEFT JOIN servicos s ON ai.servico_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (telefone) {
      query += ` AND a.telefone_cliente = ?`;
      params.push(telefone);
    }

    if (data_inicio && data_fim) {
      query += ` AND date(a.data_agendamento) BETWEEN date(?) AND date(?)`;
      params.push(data_inicio, data_fim);
    }

    query += ` GROUP BY a.id ORDER BY a.data_agendamento ASC`;

    const agendamentos = await db.all(query, params);
    return res.json(agendamentos);
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao buscar agendamentos." });
  }
}

/**
 * Atualiza o agendamento aplicando a regra de 2 dias de antecedência para clientes,
 * ou alteração livre para a parte operacional (Leila).
 */
export async function atualizarAgendamento(req: Request, res: Response) {
  const { id } = req.params;
  const { nova_data, status, operacional } = req.body; // operacional = true se for alteração pela Leila

  try {
    const db = await openDatabase();
    const agendamento = await db.get(
      `SELECT * FROM agendamentos WHERE id = ?`,
      [id],
    );

    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento não encontrado." });
    }

    // Regra dos 2 dias: Se for alteração de data pelo cliente, verificar antecedência
    if (nova_data && !operacional) {
      const dataAgendada = new Date(agendamento.data_agendamento);
      const hoje = new Date();
      const diferencaMilissegundos = dataAgendada.getTime() - hoje.getTime();
      const diferencaDias = diferencaMilissegundos / (1000 * 3600 * 24);

      if (diferencaDias < 2) {
        return res.status(400).json({
          erro: "A alteração pelo sistema só é permitida até 2 dias antes do agendamento. Para prazos menores, entre em contato por telefone.",
        });
      }
    }

    const dataAtualizada = nova_data || agendamento.data_agendamento;
    const statusAtualizado = status || agendamento.status;

    await db.run(
      `UPDATE agendamentos SET data_agendamento = ?, status = ? WHERE id = ?`,
      [dataAtualizada, statusAtualizado, id],
    );

    return res.json({ mensagem: "Agendamento atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao atualizar agendamento." });
  }
}

/**
 * Parte Gerencial: Retorna o desempenho semanal do negócio (faturamento e quantidade de agendamentos).
 */
export async function desempenhoSemanal(req: Request, res: Response) {
  try {
    const db = await openDatabase();

    // Consulta agrupando por semana/faturamento
    const desempenho = await db.all(`
      SELECT 
        strftime('%Y-%W', a.data_agendamento) as ano_semana,
        COUNT(a.id) as total_agendamentos,
        SUM(s.preco) as faturamento_total
      FROM agendamentos a
      JOIN agendamento_itens ai ON a.id = ai.agendamento_id
      JOIN servicos s ON ai.servico_id = s.id
      WHERE a.status != 'Cancelado'
      GROUP BY ano_semana
      ORDER BY ano_semana DESC
    `);

    return res.json(desempenho);
  } catch (error) {
    console.error("Erro ao buscar desempenho semanal:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno ao calcular desempenho." });
  }
}
