/**
 * @file AdminContent.tsx
 * @description Painel administrativo com autenticação por Usuário/E-mail e Senha.
 */

'use client';

import { useState, useEffect } from 'react';
import { listarAgendamentos, atualizarAgendamento, buscarDesempenhoSemanal } from '../services/api';
import Link from 'next/link';

interface Agendamento {
    id: number;
    nome_cliente: string;
    telefone_cliente: string;
    data_agendamento: string;
    status: string;
}

interface RelatorioSemanal {
    semana: string;
    total_agendamentos: number;
    faturamento_total: number;
}

export default function AdminContent() {
    const [autenticado, setAutenticado] = useState(false);
    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [erroLogin, setErroLogin] = useState('');

    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [relatorio, setRelatorio] = useState<RelatorioSemanal[]>([]);
    const [abaAtiva, setAbaAtiva] = useState<'agendamentos' | 'relatorios'>('agendamentos');

    const [agendamentoEditando, setAgendamentoEditando] = useState<Agendamento | null>(null);
    const [novaData, setNovaData] = useState('');
    const [novoStatus, setNovoStatus] = useState('');
    const [mensagemFeedback, setMensagemFeedback] = useState('');

    // Função de Login conectada ao Backend
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErroLogin('');

        try {
            const resposta = await fetch('http://localhost:3333/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: loginInput, senha: senhaInput }),
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                setAutenticado(true);
            } else {
                setErroLogin(dados.erro || 'Credenciais inválidas.');
            }
        } catch (err) {
            setErroLogin('Erro de conexão com o servidor.');
        }
    };

    useEffect(() => {
        if (autenticado) {
            carregarDados();
        }
    }, [autenticado]);

    const carregarDados = async () => {
        try {
            const dadosAgendamentos = await listarAgendamentos();
            setAgendamentos(dadosAgendamentos);

            const dadosRelatorio = await buscarDesempenhoSemanal();
            setRelatorio(dadosRelatorio);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        }
    };

    const handleSalvarEdicao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agendamentoEditando) return;

        try {
            const resposta = await atualizarAgendamento(agendamentoEditando.id, {
                nova_data: novaData ? novaData : undefined,
                status: novoStatus ? novoStatus : undefined,
                operacional: true, // Fura a regra dos 2 dias
            });

            if (resposta.id || resposta.mensagem) {
                setMensagemFeedback('Agendamento atualizado com sucesso pela Leila!');
                setAgendamentoEditando(null);
                setNovaData('');
                setNovoStatus('');
                carregarDados();
            } else {
                setMensagemFeedback(resposta.erro || 'Erro ao atualizar.');
            }
        } catch (err) {
            setMensagemFeedback('Erro de conexão.');
        }
    };

    // Tela de Login
    if (!autenticado) {
        return (
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-white">
                <div className="mb-6">
                    <Link href="/" className="text-sm font-medium text-pink-400 hover:underline">
                        ← Voltar para a Página Inicial
                    </Link>
                </div>

                <div className="text-center mb-6">
                    <span className="text-3xl inline-block mb-2">🔒</span>
                    <h1 className="text-2xl font-bold tracking-tight">Área Restrita da Leila</h1>
                    <p className="text-xs text-gray-400 mt-1">Entre com seu usuário ou e-mail e senha.</p>
                </div>

                {erroLogin && (
                    <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs text-center">
                        {erroLogin}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Usuário ou E-mail</label>
                        <input
                            type="text"
                            value={loginInput}
                            onChange={(e) => setLoginInput(e.target.value)}
                            placeholder="Ex: leila ou leila@salao.com"
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Senha</label>
                        <input
                            type="password"
                            value={senhaInput}
                            onChange={(e) => setSenhaInput(e.target.value)}
                            placeholder="Sua senha (ex: 1234)"
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-md transition text-sm"
                    >
                        Entrar no Painel
                    </button>
                </form>
            </div>
        );
    }

    // Painel Autenticado
    return (
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-800">
            <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-pink-400">Painel Operacional & Gerencial</h1>
                    <p className="text-xs text-gray-400">Salão da Cabeleleila Leila</p>
                </div>
                <button
                    onClick={() => setAutenticado(false)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
                >
                    Sair
                </button>
            </div>

            <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                    onClick={() => setAbaAtiva('agendamentos')}
                    className={`flex-1 py-3 text-sm font-semibold transition ${abaAtiva === 'agendamentos' ? 'bg-white text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'
                        }`}
                >
                    📅 Agendamentos
                </button>
                <button
                    onClick={() => setAbaAtiva('relatorios')}
                    className={`flex-1 py-3 text-sm font-semibold transition ${abaAtiva === 'relatorios' ? 'bg-white text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'
                        }`}
                >
                    📊 Desempenho Semanal
                </button>
            </div>

            <div className="p-6">
                {mensagemFeedback && (
                    <div className="mb-4 p-3 bg-pink-50 border border-pink-200 text-pink-700 rounded-xl text-xs font-medium">
                        {mensagemFeedback}
                    </div>
                )}

                {abaAtiva === 'agendamentos' && (
                    <div>
                        <h2 className="text-lg font-bold mb-4">Gerenciar Agendamentos</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-gray-600">
                                        <th className="p-3">Cliente</th>
                                        <th className="p-3">Telefone</th>
                                        <th className="p-3">Data/Hora</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agendamentos.map((ag) => (
                                        <tr key={ag.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium">{ag.nome_cliente}</td>
                                            <td className="p-3 text-gray-600">{ag.telefone_cliente}</td>
                                            <td className="p-3 text-gray-600">{new Date(ag.data_agendamento).toLocaleString()}</td>
                                            <td className="p-3">
                                                <span className="px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                                                    {ag.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => {
                                                        setAgendamentoEditando(ag);
                                                        setNovoStatus(ag.status);
                                                    }}
                                                    className="px-3 py-1.5 bg-gray-900 hover:bg-pink-600 text-white text-xs font-semibold rounded-lg transition"
                                                >
                                                    Modo Operacional
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {abaAtiva === 'relatorios' && (
                    <div>
                        <h2 className="text-lg font-bold mb-4">Desempenho e Faturamento Semanal</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {relatorio.map((item, index) => (
                                <div key={index} className="p-5 bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 rounded-2xl shadow-sm">
                                    <p className="text-xs font-semibold text-pink-600 uppercase mb-1">Semana: {item.semana}</p>
                                    <p className="text-2xl font-extrabold text-gray-800 mb-2">R$ {item.faturamento_total.toFixed(2)}</p>
                                    <p className="text-xs text-gray-600">Total de agendamentos: <span className="font-bold">{item.total_agendamentos}</span></p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {agendamentoEditando && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-2">Painel Operacional da Leila</h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Alterando agendamento de <span className="font-semibold">{agendamentoEditando.nome_cliente}</span> (Fura a regra dos 2 dias).
                        </p>

                        <form onSubmit={handleSalvarEdicao} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Novo Status</label>
                                <select
                                    value={novoStatus}
                                    onChange={(e) => setNovoStatus(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-xl text-sm"
                                >
                                    <option value="Pendente">Pendente</option>
                                    <option value="Confirmado">Confirmado</option>
                                    <option value="Concluído">Concluído</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Nova Data e Hora (Opcional)</label>
                                <input
                                    type="datetime-local"
                                    value={novaData}
                                    onChange={(e) => setNovaData(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-xl text-sm"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAgendamentoEditando(null)}
                                    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl transition"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}