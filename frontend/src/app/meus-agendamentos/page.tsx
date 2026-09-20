'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Agendamento {
    id: number;
    cliente_nome: string;
    cliente_telefone: string;
    data_hora: string;
    status: string;
    itens: { servico_nome: string; preco: number }[];
}

export default function MeusAgendamentosPage() {
    const [telefone, setTelefone] = useState('');
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [pesquisado, setPesquisado] = useState(false);
    const [mensagem, setMensagem] = useState('');

    const handleBuscar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!telefone.trim()) return;

        setCarregando(true);
        setMensagem('');
        try {
            // Ajuste o endpoint conforme a rota do seu backend em Node.js
            const res = await fetch(`http://localhost:3001/api/agendamentos/cliente?telefone=${encodeURIComponent(telefone)}`);
            const data = await res.json();

            if (res.ok) {
                setAgendamentos(data);
            } else {
                setAgendamentos([]);
                setMensagem(data.error || 'Nenhum agendamento encontrado para este telefone.');
            }
        } catch (error) {
            console.error(error);
            setMensagem('Erro ao conectar com o servidor.');
        } finally {
            setCarregando(false);
            setPesquisado(true);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link href="/" className="text-pink-600 hover:underline text-sm font-medium">
                        ← Voltar para a Página Inicial
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Meus Agendamentos</h1>
                    <p className="text-gray-600 text-sm mb-6">
                        Insira o seu número de telefone/WhatsApp cadastrado para consultar os seus horários e status.
                    </p>

                    <form onSubmit={handleBuscar} className="flex gap-3 mb-8">
                        <input
                            type="text"
                            placeholder="Ex: 14998887766"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-gray-800"
                            required
                        />
                        <button
                            type="submit"
                            disabled={carregando}
                            className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition shadow-md disabled:opacity-50"
                        >
                            {carregando ? 'Buscando...' : 'Pesquisar'}
                        </button>
                    </form>

                    {pesquisado && (
                        <div>
                            {agendamentos.length > 0 ? (
                                <div className="space-y-4">
                                    {agendamentos.map((ag) => (
                                        <div key={ag.id} className="border border-pink-100 rounded-xl p-5 bg-pink-50/40 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-100 px-2.5 py-1 rounded-full">
                                                        {ag.status}
                                                    </span>
                                                    <h3 className="text-lg font-semibold text-gray-800 mt-2">
                                                        {ag.cliente_nome}
                                                    </h3>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-medium text-gray-700 block">
                                                        📅 {new Date(ag.data_hora).toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="border-t border-pink-200/60 pt-3 mt-3">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Serviços Agendados:</p>
                                                <ul className="space-y-1">
                                                    {ag.itens?.map((item, idx) => (
                                                        <li key={idx} className="text-sm text-gray-700 flex justify-between">
                                                            <span>• {item.servico_nome}</span>
                                                            <span className="font-medium text-pink-600">R$ {Number(item.preco).toFixed(2)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    <p>{mensagem || 'Nenhum agendamento localizado.'}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}