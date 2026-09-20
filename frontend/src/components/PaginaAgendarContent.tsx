/**
 * @file PaginaAgendarContent.tsx
 * @description Lógica e interface do formulário de agendamento do cliente.
 */

'use client';

import { useState, useEffect } from 'react';
import { listarServicos, criarAgendamento } from '../services/api';
import Link from 'next/link';

interface Servico {
  id: number;
  nome: string;
  preco: number;
  duracao_minutos: number;
}

export default function PaginaAgendarContent() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [dataAgendamento, setDataAgendamento] = useState('');
  
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [alertaSemana, setAlertaSemana] = useState<{ aviso: string; sugestao_data_original: string; mensagem: string } | null>(null);

  useEffect(() => {
    listarServicos()
      .then((dados) => setServicos(dados))
      .catch((err) => console.error('Erro ao carregar serviços:', err));
  }, []);

  const handleCheckboxChange = (id: number) => {
    if (servicosSelecionados.includes(id)) {
      setServicosSelecionados(servicosSelecionados.filter((sId) => sId !== id));
    } else {
      setServicosSelecionados([...servicosSelecionados, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');
    setAlertaSemana(null);

    if (!nomeCliente || !telefoneCliente || servicosSelecionados.length === 0 || !dataAgendamento) {
      setMensagemErro('Por favor, preencha todos os campos e selecione ao menos um serviço.');
      return;
    }

    try {
      const resposta = await criarAgendamento({
        nome_cliente: nomeCliente,
        telefone_cliente: telefoneCliente,
        servicos_ids: servicosSelecionados,
        data_agendamento: dataAgendamento,
      });

      if (resposta.aviso) {
        setAlertaSemana(resposta);
        return;
      }

      if (resposta.id) {
        setMensagemSucesso('✨ Agendamento realizado com sucesso!');
        setNomeCliente('');
        setTelefoneCliente('');
        setServicosSelecionados([]);
        setDataAgendamento('');
      } else {
        setMensagemErro(resposta.erro || 'Erro ao realizar agendamento.');
      }
    } catch (err) {
      setMensagemErro('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-pink-100 p-8">
      <div className="mb-6">
        <Link href="/" className="text-sm font-medium text-pink-600 hover:underline">
          ← Voltar para a Página Inicial
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">Agende seu Horário</h1>
      <p className="text-sm text-gray-500 mb-6">Selecione os procedimentos desejados no Salão da Cabeleleila Leila.</p>

      {mensagemSucesso && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          {mensagemSucesso}
        </div>
      )}

      {mensagemErro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {mensagemErro}
        </div>
      )}

      {alertaSemana && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
          <p className="font-semibold mb-1">⚠️ {alertaSemana.aviso}</p>
          <p className="mb-2">{alertaSemana.mensagem}</p>
          <p className="text-xs font-mono bg-amber-100 p-1.5 rounded inline-block">
            Data do primeiro atendimento: {new Date(alertaSemana.sugestao_data_original).toLocaleString()}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
          <input
            type="text"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            placeholder="Ex: Maria da Silva"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp)</label>
          <input
            type="text"
            value={telefoneCliente}
            onChange={(e) => setTelefoneCliente(e.target.value)}
            placeholder="Ex: 14998887766"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Serviços Desejados (Múltipla escolha)</label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50">
            {servicos.map((servico) => (
              <label key={servico.id} className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={servicosSelecionados.includes(servico.id)}
                    onChange={() => handleCheckboxChange(servico.id)}
                    className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{servico.nome} ({servico.duracao_minutos} min)</span>
                </div>
                <span className="text-sm font-semibold text-pink-600">R$ {servico.preco.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora do Agendamento</label>
          <input
            type="datetime-local"
            value={dataAgendamento}
            onChange={(e) => setDataAgendamento(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-md transition duration-200 text-sm"
        >
          Confirmar Agendamento
        </button>
      </form>
    </div>
  );
}