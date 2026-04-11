'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">Chargement...</div>
            </div>
        );
    }

    if (!user) return null;

    // --- Détermination du rôle principal ---
    const getPrimaryRole = () => {
        if (user.projectOwnerProfile) return 'project-owner';
        if (user.expertProfile) return 'expert';
        if (user.incubatorMembers?.length > 0) return 'incubator-member';
        return 'member';
    };

    const role = getPrimaryRole();
    const isIncubatorMember = role === 'incubator-member';

    // --- Éléments de navigation conditionnels ---
    const navItems = [
        { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
        { href: '/dashboard/profile', label: 'Mon profil', icon: '👤' },
        ...(isIncubatorMember ? [
            { href: '/dashboard/incubator', label: 'Mes incubateurs', icon: '🏢' },
            { href: '/dashboard/incubator/create', label: 'Créer incubateur', icon: '➕' },
            { href: '/dashboard/members', label: 'Équipe', icon: '👥' },
            { href: '/dashboard/documents', label: 'Documents', icon: '📄' }
        ] : []),
        ...(role === 'project-owner' ? [
            { href: '/dashboard/projects', label: 'Mes projets', icon: '🚀' }
        ] : []),
        ...(role === 'expert' ? [
            { href: '/dashboard/expertise', label: 'Mes expertises', icon: '⭐' }
        ] : [])
    ];

    // --- Affichage des infos utilisateur (sécurisé) ---
    const firstName = user.profile?.first_name || '';
    const lastName = user.profile?.last_name || '';
    const firstLetter = firstName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ProjectStruct Dashboard
                        </Link>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {firstLetter || '?'}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {firstName} {lastName}
                                    </p>
                                    <p className="text-sm text-gray-500 capitalize">
                                        {role.replace('-', ' ')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                <nav className="w-64 bg-white border-r shadow-sm">
                    <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
                        <ul className="space-y-2">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full ${
                                            pathname === item.href
                                                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        <span className="mr-3 text-lg">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
                <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}