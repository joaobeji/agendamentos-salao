/**
 * @file page.tsx (Meus Agendamentos)
 * @description Wrapper principal da página de consulta de agendamentos do cliente.
 */

import MeusAgendamentosContent from '../../components/MeusAgendamentosContent';

export default function MeusAgendamentosPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-10 px-4 flex flex-col items-center">
            <MeusAgendamentosContent />
        </main>
    );
}