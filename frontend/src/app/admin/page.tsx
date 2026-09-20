/**
 * @file page.tsx (Admin)
 * @description Rota protegida por senha para o Painel Administrativo da Leila.
 */

import AdminContent from '../../components/AdminContent';

export default function PaginaAdmin() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-pink-950 py-10 px-4 flex flex-col items-center">
            <AdminContent />
        </main>
    );
}