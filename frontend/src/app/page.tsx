import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-pink-100">
                <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
                    💇‍♀️
                </div>

                <h1 className="text-3xl font-extrabold text-pink-600 mb-2">
                    Salão da Cabeleleila Leila
                </h1>

                <p className="text-gray-600 mb-8 text-sm">
                    O melhor atendimento e cuidado para o seu visual. Faça ou consulte o seu agendamento online de forma rápida e prática!
                </p>

                <div className="space-y-3">
                    <Link
                        href="/agendar"
                        className="block w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-md hover:from-pink-600 hover:to-rose-600 transition duration-200 text-center"
                    >
                        Fazer Agendamento (Cliente)
                    </Link>

                    <Link
                        href="/meus-agendamentos"
                        className="block w-full py-3 px-4 bg-white text-pink-600 border border-pink-300 font-semibold rounded-xl shadow-sm hover:bg-pink-50 transition duration-200 text-center"
                    >
                        🔍 Consultar / Meus Agendamentos
                    </Link>

                    <Link
                        href="/admin"
                        className="block w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl shadow-md hover:bg-gray-800 transition duration-200 text-center"
                    >
                        🔒 Área Administrativa (Leila)
                    </Link>
                </div>

                <p className="text-xs text-gray-400 mt-8">
                    Sistema desenvolvido para atendimento exclusivo e gestão completa do salão.
                </p>
            </div>
        </main>
    );
}