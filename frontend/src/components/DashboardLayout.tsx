'use client';

import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  User,
  Factory,
  Plus,
  Users,
  FolderKanban,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Calendar,
  Target,
  ClipboardCheck,
  Presentation,
  LayoutDashboard,
  Bot,
  TreePine,
  BarChart3,
  DollarSign,
  LineChart,
  Leaf,
  FileText,
  HeartHandshake,
  CheckCircle2,
  Radar,
  Sparkles,
  CalendarClock,
} from 'lucide-react';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/shared/ui';
import { NotificationsBell } from '@/components/NotificationsBell';
import { useActiveProject } from '@/hooks/useActiveProject';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
  section?: string;
  match?: 'exact' | 'prefix';
}

const MODULE_LABELS: Record<string, string> = {
  gbm: "Modèle d'Affaires Vert",
  'business-plan': "Plan d'Affaires",
  market: 'Accès au Marché',
  funding: 'Financement',
  impact: "Mesure de l'Impact",
  'eco-design': 'Éco-conception',
  documents: 'Documents',
  coach: 'AI Project Coach',
  coachings: 'Suivi coaching',
  evaluations: 'Évaluation & décision',
};

const PROJECT_MODULES: { suffix: string; label: string; icon: LucideIcon; match?: 'exact' | 'prefix' }[] = [
  { suffix: '', label: "Vue d'ensemble", icon: LayoutDashboard },
  { suffix: '/gbm', label: "Modèle d'Affaires Vert", icon: TreePine },
  { suffix: '/business-plan', label: "Plan d'Affaires", icon: BarChart3 },
  { suffix: '/market', label: 'Accès au Marché', icon: Target },
  { suffix: '/funding', label: 'Financement', icon: DollarSign },
  { suffix: '/impact', label: "Mesure de l'Impact", icon: LineChart },
  { suffix: '/eco-design', label: 'Éco-conception', icon: Leaf },
  { suffix: '/documents', label: 'Documents', icon: FileText },
  { suffix: '/coach', label: 'AI Project Coach', icon: Bot },
  { suffix: '/coachings', label: 'Suivi coaching', icon: HeartHandshake, match: 'exact' },
  { suffix: '/coachings/sessions', label: 'Agenda des sessions', icon: CalendarClock },
  { suffix: '/evaluations', label: 'Évaluation & décision', icon: ClipboardCheck },
];

const SECTION_LABELS: Record<string, string> = {
  overview: 'Vue d\u2019ensemble',
  expert: 'Expertise',
  porteur: 'Mes projets',
  incubator: 'Incubateur',
  project: 'Projet en cours',
  account: 'Compte',
};

function isNavItemActive(item: NavLinkItem, pathname: string): boolean {
  if (item.match === 'exact') return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

type Crumb = { label: string; href: string };

function buildBreadcrumb(pathname: string, projectName?: string): Crumb[] | null {
  const base = '/dashboard';
  const parts = pathname.replace(base, '').split('/').filter(Boolean);
  const home: Crumb = { label: 'Tableau de bord', href: base };

  if (parts.length === 0) return [home];

  if (parts[0] === 'profile') return [home, { label: 'Mon profil', href: `${base}/profile` }];
  if (parts[0] === 'notifications') return [home, { label: 'Notifications', href: `${base}/notifications` }];

  if (parts[0] === 'project-owner') {
    if (parts[1] === 'projects') {
      const trail: Crumb[] = [home, { label: 'Mes projets', href: `${base}/project-owner/projects` }];
      if (parts[2]) {
        trail.push({
          label: projectName ?? 'Projet',
          href: `${base}/project-owner/projects/${parts[2]}`,
        });
        if (MODULE_LABELS[parts[3]]) {
          trail.push({
            label: MODULE_LABELS[parts[3]],
            href: `${trail[2].href}/${parts[3]}`,
          });
        }
      }
      return trail;
    }
    if (parts[1] === 'participations') {
      return [home, { label: 'Participations', href: `${base}/project-owner/participations` }];
    }
    if (parts[1] === 'cohorts') {
      return [home, { label: 'Cohortes', href: `${base}/project-owner/cohorts` }];
    }
    return [home, { label: 'Mon profil', href: `${base}/project-owner` }];
  }

  if (parts[0] === 'incubator') {
    return [
      home,
      { label: parts[1] === 'create' ? 'Créer un incubateur' : 'Incubateur', href: `${base}/incubator` },
    ];
  }

  if (parts[0] === 'expert') {
    const labels: Record<string, string> = {
      matching: 'Matching projets',
      'matching-projects': 'Projets correspondants',
      cohorts: 'Cohortes',
      evaluations: 'Évaluations',
      coachings: 'Coachings',
      recommendations: 'Recommandations IA',
      'mon-coaching': 'Mon coaching',
    };
    if (labels[parts[1]]) {
      return [home, { label: 'Expertise', href: `${base}/expert` }, { label: labels[parts[1]], href: `${base}/expert/${parts[1]}` }];
    }
    return [home, { label: 'Expertise', href: `${base}/expert` }];
  }

  return null;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: unreadData } = useUnreadCount();
  const sidebarUnread = unreadData?.count ?? 0;
  useNotificationSocket();
  const isProjectOwner = user?.role === 'PROJECT_OWNER';
  const { projects, activeProject, projectId, loading: projectsLoading } =
    useActiveProject(!!isProjectOwner);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
  const isExpert = userRole === 'EXPERT';
  const isIncubatorMember = userRole === 'INCUBATOR_MEMBER';

  const baseItems: NavLinkItem[] = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, section: 'overview', match: 'exact' },
  ];

  const roleItems: NavLinkItem[] = isExpert
    ? [
        { href: '/dashboard/expert', label: 'Profile Expert', icon: GraduationCap, section: 'expert', match: 'exact' },
        { href: '/dashboard/expert/matching', label: 'Matching projets', icon: Target, section: 'expert', match: 'prefix' },
        { href: '/dashboard/expert/matching-projects', label: 'Projets correspondants', icon: Radar, section: 'expert', match: 'prefix' },
        { href: '/dashboard/expert/cohorts', label: 'Cohortes', icon: Users, section: 'expert', match: 'prefix' },
        { href: '/dashboard/expert/recommendations', label: 'Recommandations IA', icon: Sparkles, section: 'expert', match: 'prefix' },
        { href: '/dashboard/expert/evaluations', label: 'Évaluations', icon: ClipboardCheck, section: 'expert', match: 'prefix' },
        { href: '/dashboard/expert/mon-coaching', label: 'Mon coaching', icon: HeartHandshake, section: 'expert', match: 'prefix' },
        { href: '/dashboard/expert/coachings', label: 'Coachings', icon: Presentation, section: 'expert', match: 'exact' },
        { href: '/dashboard/expert/coachings/sessions', label: 'Mes sessions', icon: CalendarClock, section: 'expert', match: 'prefix' },
      ]
    : isProjectOwner
      ? [
          { href: '/dashboard/project-owner/projects', label: 'Mes projets', icon: FolderKanban, section: 'porteur', match: 'prefix' },
          { href: '/dashboard/project-owner/participations', label: 'Participations', icon: Calendar, section: 'porteur', match: 'prefix' },
          { href: '/dashboard/project-owner/cohorts', label: 'Cohortes', icon: Users, section: 'porteur', match: 'prefix' },
        ]
      : isIncubatorMember
        ? [
            { href: '/dashboard/incubator', label: 'Incubateurs', icon: Factory, section: 'incubator', match: 'prefix' },
            { href: '/dashboard/incubator/create', label: 'Créer un incubateur', icon: Plus, section: 'incubator', match: 'prefix' },
          ]
        : [];

  const accountItems: NavLinkItem[] = [
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, section: 'account', match: 'prefix' },
    {
      href: isProjectOwner ? '/dashboard/project-owner' : '/dashboard/profile',
      label: 'Mon profil',
      icon: User,
      section: 'account',
      match: 'exact',
    },
  ];

  const projectItems: NavLinkItem[] = projectId
    ? PROJECT_MODULES.map((mod) => ({
        href: `/dashboard/project-owner/projects/${projectId}${mod.suffix}`,
        label: mod.label,
        icon: mod.icon,
        section: 'project',
        match: mod.match ?? (mod.suffix === '' ? 'exact' : 'prefix'),
      }))
    : [];

  const navItems = [...baseItems, ...roleItems, ...projectItems, ...accountItems];

  const firstName = user.profile?.first_name || '';
  const lastName = user.profile?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = fullName ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : '??';

  const roleLabels: Record<string, string> = {
    EXPERT: 'Expert',
    PROJECT_OWNER: 'Porteur de projet',
    INCUBATOR_MEMBER: 'Membre incubateur',
  };
  const currentRoleLabel = userRole ? roleLabels[userRole] : 'Membre';

  const breadcrumb = buildBreadcrumb(pathname ?? '', activeProject?.name);
  const crumbTail = breadcrumb ? breadcrumb.slice(1) : [];

  const closeDrawer = () => setSidebarOpen(false);

  const renderNavItem = (item: NavLinkItem) => {
    const Icon = item.icon;
    const isActive = isNavItemActive(item, pathname ?? '');
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={closeDrawer}
        aria-current={isActive ? 'page' : undefined}
        className={`
          group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200 relative
          ${isActive ? 'bg-accent/10 text-accent shadow-sm' : 'text-ink-2 hover:bg-moss-light hover:text-ink'}
        `}
      >
        <Icon size={18} className={isActive ? 'text-accent' : 'text-ink-3 group-hover:text-ink'} />
        <span className="truncate">{item.label}</span>
        {item.href === '/dashboard/notifications' && sidebarUnread > 0 && (
          <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red text-white text-[9px] font-bold px-1">
            {sidebarUnread > 99 ? '99+' : sidebarUnread}
          </span>
        )}
        {isActive && <ChevronRight size={14} className="ml-auto opacity-60 shrink-0" />}
      </Link>
    );
  };

  const renderSection = (item: NavLinkItem, index: number, items: NavLinkItem[]) => {
    const showSectionHeader = index === 0 || item.section !== items[index - 1]?.section;
    const isProjectHeader = showSectionHeader && item.section === 'project' && activeProject?.name;
    return (
      <div key={item.href}>
        {showSectionHeader && item.section && (
          <div className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider px-3 mt-4 mb-2 first:mt-0 truncate">
            {isProjectHeader ? activeProject.name : SECTION_LABELS[item.section] || item.section}
          </div>
        )}
        {renderNavItem(item)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-72 bg-surface border-r border-border shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 flex flex-col
        `}
        aria-label="Navigation principale"
      >
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-xl font-bold tracking-tight">
                <span className="text-moss">Project</span>
                <span className="text-amber">Struct</span>
              </div>
              <div className="text-xs text-ink-3 mt-1 capitalize flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                Dashboard · {currentRoleLabel}
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="lg:hidden p-1 rounded-lg hover:bg-moss-light"
              aria-label="Fermer le menu"
            >
              <X size={18} className="text-ink-2" />
            </button>
          </div>
        </div>

        {isProjectOwner && (
          <div className="px-4 pt-4 pb-1">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider">
                Accès rapide
              </span>
              <Link
                href="/dashboard/project-owner/projects"
                onClick={closeDrawer}
                aria-label="Créer un nouveau projet"
                className="text-xs font-medium text-accent hover:text-moss flex items-center gap-1 transition-colors"
              >
                <Plus size={13} /> Nouveau
              </Link>
            </div>
            {projectsLoading ? (
              <div className="px-3 py-2 space-y-2">
                <div className="h-8 rounded-lg bg-surface animate-pulse" />
                <div className="h-8 rounded-lg bg-surface animate-pulse" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-0.5 max-h-44 overflow-y-auto">
                {projects.slice(0, 6).map((p) => {
                  const isCurrent = p.id === projectId;
                  return (
                    <Link
                      key={p.id}
                      href={`/dashboard/project-owner/projects/${p.id}`}
                      onClick={closeDrawer}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                        isCurrent
                          ? 'bg-accent/10 text-accent font-medium'
                          : 'text-ink-2 hover:bg-moss-light hover:text-ink'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrent ? 'bg-accent' : 'bg-ink-3 group-hover:bg-moss'}`} />
                      <span className="truncate">{p.name}</span>
                      {isCurrent && <CheckCircle2 size={14} className="ml-auto shrink-0 text-accent opacity-70" />}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Link
                href="/dashboard/project-owner/projects"
                onClick={closeDrawer}
                className="block px-3 py-2 text-sm text-ink-3 hover:text-ink hover:bg-moss-light rounded-lg transition-colors"
              >
                Créer votre premier projet →
              </Link>
            )}
          </div>
        )}

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => renderSection(item, idx, navItems))}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-moss-light/30 mb-3">
            <div className="w-[72px] h-[72px] rounded-full flex-shrink-0 flex items-center justify-center
              bg-gradient-to-br from-moss to-[#1a5c3a] shadow-[0_0_0_3px_rgba(45,122,82,0.2),0_2px_12px_rgba(45,122,82,0.15)]
              font-syne text-[22px] font-extrabold text-[#a0e0b8]">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-ink">{fullName || 'Utilisateur'}</div>
              <div className="text-xs text-ink-3 capitalize truncate">{currentRoleLabel}</div>
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-moss-light transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} className="text-ink-2" />
            </button>
            <div className="hidden sm:flex items-center text-sm text-ink-3 min-w-0">
              <span className="text-[#4b8461] shrink-0">Tool</span>
              <span className="text-[#c9a84c] shrink-0">Box</span>
              <ChevronRight size={14} className="mx-1.5 opacity-50 shrink-0" />
              <span className="capitalize shrink-0">{currentRoleLabel}</span>
              {crumbTail.map((crumb, i) => {
                const isLast = i === crumbTail.length - 1;
                return (
                  <Fragment key={i}>
                    <ChevronRight size={14} className="mx-1.5 opacity-50 shrink-0" />
                    {isLast ? (
                      <span className="font-medium text-ink truncate max-w-[180px] md:max-w-[280px]" title={crumb.label}>
                        {crumb.label}
                      </span>
                    ) : (
                      <Link href={crumb.href} className="shrink-0 hover:text-moss transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationsBell />
            <Badge variant="green" className="hidden sm:flex gap-1 items-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Actif
            </Badge>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}