/**
 * @file page.tsx (Agendamento)
 * @description Wrapper principal da página de agendamento.
 */

import PaginaAgendarContent from '../../components/PaginaAgendarContent';

export default function PaginaAgendar() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-10 px-4 flex flex-col items-center">
            <PaginaAgendarContent />
        </main>
    );
}