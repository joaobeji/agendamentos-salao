/**
 * @file MeusAgendamentosContent.tsx
 * @description Componente ajustado para consulta e gerenciamento de agendamentos via telefone do cliente.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Servico {
    id: number;
    nome: string;
    preco: number;
}

interface Agendamento {
    id: number;
    nome_cliente?: string;
    telefone_cliente?: string;
    data_agendamento?: string;
    status: string;
    servicos_nomes?: string;
    valor_total?: number;
}

export default function MeusAgendamentosContent() {
    const [telefone, setTelefone] = useState('');
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [pesquisado, setPesquisado] = useState(false);
    const [mensagem, setMensagem] = useState('');

    const [servicosDisponiveis, setServicosDisponiveis] = useState<Servico[]>([]);

    // Estados para o Modal de Edição
    const [agendamentoEditando, setAgendamentoEditando] = useState<Agendamento | null>(null);
    const [novaData, setNovaData] = useState('');
    const [novoStatus, setNovoStatus] = useState('');
    const [servicosSelecionadosIds, setServicosSelecionadosIds] = useState<number[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState('');

    useEffect(() => {
        fetch('http://localhost:3333/api/servicos')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setServicosDisponiveis(data);
            })
            .catch(err => console.error('Erro ao buscar serviços:', err));
    }, []);

    const handleBuscar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!telefone.trim()) return;

        setCarregando(true);
        setMensagem('');
        try {
            const res = await fetch(`http://localhost:3333/api/agendamentos?telefone=${encodeURIComponent(telefone)}`);
            const data = await res.json();

            if (res.ok) {
                setAgendamentos(Array.isArray(data) ? data : [data]);
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

    const abrirEdicao = (ag: Agendamento) => {
        setAgendamentoEditando(ag);
        if (ag.data_agendamento) {
            const d = new Date(ag.data_agendamento);
            if (!isNaN(d.getTime())) {
                const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                setNovaData(isoLocal);
            } else {
                setNovaData('');
            }
        } else {
            setNovaData('');
        }
        setNovoStatus(ag.status || 'Pendente');

        if (ag.servicos_nomes) {
            const nomesArray = ag.servicos_nomes.split(',').map(n => n.trim().toLowerCase());
            const idsEncontrados = servicosDisponiveis
                .filter(s => nomesArray.includes(s.nome.toLowerCase()))
                .map(s => s.id);
            setServicosSelecionadosIds(idsEncontrados);
        } else {
            setServicosSelecionadosIds([]);
        }

        setFeedbackModal('');
    };

    const toggleServicoSelecionado = (id: number) => {
        setServicosSelecionadosIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSalvarEdicao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agendamentoEditando) return;

        // VALIDAÇÃO DE 2 DIAS (48 HORAS)
        if (novaData) {
            const dataHoraSelecionada = new Date(novaData).getTime();
            const agora = new Date().getTime();
            const diferencaEmHoras = (dataHoraSelecionada - agora) / (1000 * 60 * 60);

            if (diferencaEmHoras < 48) {
                setFeedbackModal('⚠️ Alterações online só podem ser feitas com pelo menos 2 dias (48 horas) de antecedência. Por favor, entre em contato com o salão para solicitar a alteração.');
                return;
            }
        }

        setSalvando(true);
        setFeedbackModal('');

        try {
            const dadosAtualizados = {
                nova_data: novaData ? new Date(novaData).toISOString() : agendamentoEditando.data_agendamento,
                status: novoStatus,
                servicos_ids: servicosSelecionadosIds,
                operacional: true
            };

            const response = await fetch(`http://localhost:3333/api/agendamentos/${agendamentoEditando.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosAtualizados),
            });

            const data = await response.json();

            if (response.ok) {
                setFeedbackModal('Agendamento atualizado com sucesso!');
                setTimeout(async () => {
                    setAgendamentoEditando(null);
                    const res = await fetch(`http://localhost:3333/api/agendamentos?telefone=${encodeURIComponent(telefone)}`);
                    const refreshedData = await res.json();
                    if (res.ok) setAgendamentos(Array.isArray(refreshedData) ? refreshedData : [refreshedData]);
                }, 1000);
            } else {
                setFeedbackModal(data.erro || 'Erro ao atualizar agendamento.');
            }
        } catch (error) {
            console.error(error);
            setFeedbackModal('Erro de conexão ao salvar.');
        } finally {
            setSalvando(false);
        }
    };

    const formatarData = (dataStr?: string) => {
        if (!dataStr) return 'Data não informada';
        const data = new Date(dataStr);
        if (isNaN(data.getTime())) return dataStr;
        return data.toLocaleString('pt-BR');
    };

    return (
        <div className="max-w-3xl w-full mx-auto p-4">
            <div className="mb-6">
                <Link href="/" className="text-pink-600 hover:underline text-sm font-medium">
                    ← Voltar para a Página Inicial
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Meus Agendamentos</h1>
                <p className="text-gray-600 text-sm mb-6">
                    Insira o seu número de telefone/WhatsApp cadastrado para consultar os seus horários, status e gerenciar agendamentos.
                </p>

                <form onSubmit={handleBuscar} className="flex gap-3 mb-8">
                    <input
                        type="text"
                        placeholder="Ex: 82998361546"
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
                            <div className="space-y-5">
                                {agendamentos.map((ag) => {
                                    const listaServicos = ag.servicos_nomes
                                        ? ag.servicos_nomes.split(',').map(s => s.trim()).filter(Boolean)
                                        : [];

                                    return (
                                        <div key={ag.id} className="border border-pink-200 rounded-2xl p-6 bg-gradient-to-br from-pink-50/50 to-white shadow-sm hover:shadow-md transition">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-pink-100">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                                                            {ag.status || 'Pendente'}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-mono">ID #{ag.id}</span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-800 mt-1">
                                                        {ag.nome_cliente || 'Cliente'}
                                                    </h3>
                                                    {ag.telefone_cliente && (
                                                        <p className="text-xs text-gray-500 mt-0.5">📞 {ag.telefone_cliente}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                    <div className="text-right">
                                                        <span className="text-xs font-semibold text-gray-500 block">Data e Hora:</span>
                                                        <span className="text-sm font-semibold text-gray-800">
                                                            📅 {formatarData(ag.data_agendamento)}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => abrirEdicao(ag)}
                                                        className="px-3.5 py-2 bg-white border border-pink-300 text-pink-600 hover:bg-pink-600 hover:text-white rounded-xl text-xs font-semibold transition shadow-sm"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Serviço(s) Agendado(s):</p>
                                                    {listaServicos.length > 0 ? (
                                                        <ul className="list-disc list-inside text-sm text-gray-800 space-y-1 bg-white/80 p-3 rounded-xl border border-pink-100">
                                                            {listaServicos.map((servico, index) => (
                                                                <li key={index} className="font-medium">{servico}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 italic">Nenhum serviço especificado</p>
                                                    )}
                                                </div>

                                                {ag.valor_total !== null && ag.valor_total !== undefined && (
                                                    <div className="text-left md:text-right bg-pink-100/60 p-3 rounded-xl border border-pink-200/50">
                                                        <span className="text-xs font-semibold text-gray-600 block uppercase tracking-wider">Valor Total</span>
                                                        <span className="text-lg font-extrabold text-pink-600">
                                                            R$ {Number(ag.valor_total).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <p>{mensagem || 'Nenhum agendamento localizado.'}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Edição */}
            {agendamentoEditando && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-pink-100 my-8">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Editar Agendamento #{agendamentoEditando.id}</h3>
                            <button
                                onClick={() => setAgendamentoEditando(null)}
                                className="text-gray-400 hover:text-gray-600 font-bold text-lg px-2"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSalvarEdicao} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                                    Nova Data e Horário
                                </label>
                                <input
                                    type="datetime-local"
                                    value={novaData}
                                    onChange={(e) => setNovaData(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm text-gray-800"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select
                                    value={novoStatus}
                                    onChange={(e) => setNovoStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm text-gray-800 bg-white"
                                >
                                    <option value="Pendente">Pendente</option>
                                    <option value="Confirmado">Confirmado</option>
                                    <option value="Concluído">Concluído</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                    Adicionar ou Remover Serviços
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50/50">
                                    {servicosDisponiveis.length > 0 ? (
                                        servicosDisponiveis.map(servico => {
                                            const selecionado = servicosSelecionadosIds.includes(servico.id);
                                            return (
                                                <div
                                                    key={servico.id}
                                                    onClick={() => toggleServicoSelecionado(servico.id)}
                                                    className={`flex justify-between items-center p-2.5 rounded-lg border cursor-pointer transition text-sm ${selecionado
                                                            ? 'bg-pink-50 border-pink-300 text-pink-900 font-medium shadow-sm'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selecionado}
                                                            onChange={() => { }}
                                                            className="rounded text-pink-600 focus:ring-pink-500 h-4 w-4"
                                                        />
                                                        <span>{servico.nome}</span>
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-600">
                                                        R$ {Number(servico.preco).toFixed(2)}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-500 text-center py-2">Carregando serviços disponíveis...</p>
                                    )}
                                </div>
                            </div>

                            {feedbackModal && (
                                <p className={`text-xs font-medium p-2.5 rounded-lg text-center ${feedbackModal.includes('sucesso')
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {feedbackModal}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAgendamentoEditando(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="flex-1 px-4 py-2.5 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition shadow-md disabled:opacity-50 text-sm"
                                >
                                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}