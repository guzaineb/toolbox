'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/shared/ui';
import {
  LayoutDashboard, User, Factory, Plus,
  Users,
  FolderKanban,
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-2 text-sm font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userRole = user.role;
  const isAdmin = userRole === 'admin';
  const isExpert = userRole === 'expert';
  const isProjectOwner = userRole === 'project_owner';
  const isIncubatorMember = userRole === 'incubator_membre';

  const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'Mon profil', icon: User },
    ...(isProjectOwner ? [{ href: '/dashboard/project-owner', label: 'Projets', icon: FolderKanban }] : []),
    ...(isExpert ? [{ href: '/dashboard/expert', label: 'Expertise', icon: GraduationCap }] : []),
    ...(isIncubatorMember
      ? [
        { href: '/dashboard/incubator', label: 'Incubateur', icon: Factory },
        { href: '/dashboard/incubator/create', label: 'Créer', icon: Plus },
        { href: '/dashboard/members', label: 'Équipe', icon: Users },
      ]
      : []),
    ...(isAdmin ? [{ href: '/dashboard/admin', label: 'Administration', icon: Settings }] : []),
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  ];

  const firstName = user.profile?.first_name || '';
  const lastName = user.profile?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = fullName ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : '??';

  const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    expert: 'Expert',
    project_owner: 'Porteur de projet',
    incubator_membre: 'Membre incubateur',
  };
  const currentRoleLabel = userRole ? roleLabels[userRole] : 'Membre';

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-72 bg-surface border-r border-border shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 flex flex-col
        `}
      >
        {/* Logo & Brand */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-xl font-bold tracking-tight">
                <div className="font-display text-xl font-bold tracking-tight">
                  <span className="text-moss">Tool</span>
                  <span className="text-amber">Box</span>
                </div>
              </div>
              <div className="text-xs text-ink-3 mt-1 capitalize flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                Dashboard · {currentRoleLabel}
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-moss-light"
            >
              <X size={18} className="text-ink-2" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider px-3 mb-3">
            Menu principal
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 relative
                  ${isActive
                    ? 'bg-accent/10 text-accent shadow-sm'
                    : 'text-ink-2 hover:bg-moss-light hover:text-ink'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-accent' : 'text-ink-3 group-hover:text-ink'} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-moss-light/30 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-light text-white flex items-center justify-center text-sm font-semibold shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-ink">{fullName || 'Utilisateur'}</div>
              <div className="text-xs text-ink-3 capitalize truncate">
                {currentRoleLabel}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-ink-2 bg-surface border border-border rounded-xl hover:bg-moss-light hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut size={16} className="group-hover:text-red-500" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-moss-light transition-colors"
            >
              <Menu size={20} className="text-ink-2" />
            </button>
            <div className="hidden sm:flex items-center text-sm text-ink-3">
              <span className="text-[#4b8461]">Tool</span>
              <span className="text-[#c9a84c]">Box</span>
              <ChevronRight size={14} className="mx-1.5 opacity-50" />
              <span className="capitalize">{currentRoleLabel}</span>
              <ChevronRight size={14} className="mx-1.5 opacity-50" />
              <span className="font-medium text-ink">
                {NAV_ITEMS.find(item => item.href === pathname)?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="green" className="hidden sm:flex gap-1 items-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Actif
            </Badge>
            <Link href="/invite">
              <button className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-moss-light transition-all text-ink-2">
                Invitation
              </button>
            </Link>
          </div>
        </header>

        {/* Dynamic content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}