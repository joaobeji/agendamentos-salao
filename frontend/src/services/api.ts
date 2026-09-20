/**
 * @file api.ts
 * @description Configuração do cliente HTTP para comunicação com o backend da API.
 */

const API_URL = "http://localhost:3333/api";

export async function listarServicos() {
  const resposta = await fetch(`${API_URL}/servicos`);
  if (!resposta.ok) throw new Error("Erro ao buscar serviços");
  return resposta.json();
}

export async function criarAgendamento(dados: {
  nome_cliente: string;
  telefone_cliente: string;
  servicos_ids: number[];
  data_agendamento: string;
}) {
  const resposta = await fetch(`${API_URL}/agendamentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  return resposta.json();
}

/**
 * Lista agendamentos permitindo filtros opcionais por telefone, data de início e data de fim.
 */
export async function listarAgendamentos(filtros?: {
  telefone?: string;
  data_inicio?: string;
  data_fim?: string;
}) {
  const params = new URLSearchParams();

  if (filtros?.telefone) params.append("telefone", filtros.telefone);
  if (filtros?.data_inicio) params.append("data_inicio", filtros.data_inicio);
  if (filtros?.data_fim) params.append("data_fim", filtros.data_fim);

  const query = params.toString() ? `?${params.toString()}` : "";
  const resposta = await fetch(`${API_URL}/agendamentos${query}`);

  if (!resposta.ok) throw new Error("Erro ao buscar agendamentos");
  return resposta.json();
}

export async function atualizarAgendamento(
  id: number,
  dados: { nova_data?: string; status?: string; operacional: boolean },
) {
  const resposta = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  return resposta.json();
}

export async function buscarDesempenhoSemanal() {
  const resposta = await fetch(`${API_URL}/relatorios/desempenho-semanal`);
  if (!resposta.ok) throw new Error("Erro ao buscar desempenho semanal");
  return resposta.json();
}
