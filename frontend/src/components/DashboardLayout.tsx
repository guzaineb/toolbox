'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { usePathname, useRouter } from 'next/navigation'
import { Badge } from '@/components/shared/ui'
import {
  LayoutDashboard, User, Factory,
  FolderKanban,
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-ink2 text-sm font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const userRole = user.role
  const isAdmin = userRole === 'admin'
  const isExpert = userRole === 'expert'
  const isProjectOwner = userRole === 'project_owner'
  const isIncubatorMember = userRole === 'incubator_membre'

  const NAV_ITEMS = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    ...(isProjectOwner ? [{ href: '/dashboard/project-owner/profile', label: 'Profil porteur', icon: FolderKanban }] : []),
    ...(isProjectOwner ? [{ href: '/dashboard/project-owner', label: 'Mes Projets', icon: FolderKanban }] : []),
    ...(isExpert ? [{ href: '/dashboard/expert', label: 'Expertise', icon: GraduationCap }] : []),
    ...(isExpert || isIncubatorMember
      ? [{ href: '/dashboard/incubator/projects', label: 'Suivi projets', icon: FolderKanban }]
      : []),
    ...(isIncubatorMember
      ? [{ href: '/dashboard/incubator', label: 'Incubateur', icon: Factory }]
      : []),
    ...(isAdmin ? [{ href: '/dashboard/admin', label: 'Administration', icon: Settings }] : []),
    { href: '/dashboard/profile', label: 'Mon profil', icon: User },
  ]

  const firstName = user.profile?.first_name || ''
  const lastName = user.profile?.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  const initials = fullName ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : '??'

  const roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    expert: 'Expert',
    project_owner: 'Porteur de projet',
    incubator_membre: 'Membre incubateur',
  }
  const currentRoleLabel = userRole ? roleLabels[userRole] : 'Membre'

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-72'

  return (
    <div className="min-h-screen bg-cream flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen ${sidebarWidth} bg-surface border-r border-border shadow-lg
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 flex flex-col
        `}
      >
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className={cn(sidebarCollapsed && 'hidden')}>
              <div className="flex items-center gap-2">
                <div className="w-[8px] h-[8px] rounded-full bg-moss" />
                <span className="font-syne text-xl font-bold tracking-tight">
                  <span className="text-moss">Tool</span>
                  <span className="text-amber">Box</span>
                </span>
              </div>
              <div className="text-xs text-ink3 mt-1 capitalize flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                Dashboard
              </div>
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-moss-light"
              >
                <X size={18} className="text-ink2" />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-thin">
          {!sidebarCollapsed && (
            <div className="text-[11px] font-semibold text-ink3 uppercase tracking-[0.08em] px-3 mb-3">
              Menu principal
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                  isActive
                    ? 'bg-accent/10 text-accent shadow-sm'
                    : 'text-ink2 hover:bg-moss-light hover:text-ink',
                  sidebarCollapsed && 'justify-center px-2',
                )}
              >
                <Icon size={18} className={cn(isActive ? 'text-accent' : 'text-ink3 group-hover:text-ink')} />
                {!sidebarCollapsed && (
                  <>
                    <span>{item.label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex items-center justify-center border-t border-border py-3 text-ink3 hover:text-ink hover:bg-moss-light/30 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} className={cn('transition-transform duration-200', sidebarCollapsed && 'rotate-180')} />
        </button>

        <div className={cn('p-4 border-t border-border mt-auto', sidebarCollapsed && 'px-2')}>
          <div className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl bg-moss-light/30 mb-3',
            sidebarCollapsed && 'flex-col px-2',
          )}>
            <div className={cn(
              'rounded-full flex-shrink-0 flex items-center justify-center',
              'bg-gradient-to-br from-moss to-[#1a5c3a] shadow-[0_0_0_3px_rgba(45,122,82,0.2),0_2px_12px_rgba(45,122,82,0.15)]',
              sidebarCollapsed ? 'w-10 h-10 text-sm' : 'w-[72px] h-[72px] text-[22px]',
              'font-syne font-extrabold text-[#a0e0b8]',
            )}>
              {initials}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-ink">{fullName || 'Utilisateur'}</div>
                <div className="text-xs text-ink3 capitalize truncate">{currentRoleLabel}</div>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-ink2 bg-surface border border-border rounded-xl hover:bg-moss-light hover:text-red-600 transition-all duration-200 group',
              sidebarCollapsed ? 'w-10 h-10 mx-auto p-0' : 'w-full',
            )}
          >
            <LogOut size={16} className="group-hover:text-red-500" />
            {!sidebarCollapsed && 'Se déconnecter'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-moss-light transition-colors"
            >
              <Menu size={20} className="text-ink2" />
            </button>
            <div className="hidden sm:flex items-center text-sm text-ink3">
              <span className="font-syne font-bold">
                <span className="text-moss">Tool</span>
                <span className="text-amber">Box</span>
              </span>
              <ChevronRight size={14} className="mx-1.5 opacity-50" />
              <span className="capitalize">{currentRoleLabel}</span>
              <ChevronRight size={14} className="mx-1.5 opacity-50" />
              <span className="font-medium text-ink">
                {NAV_ITEMS.find(item => pathname.startsWith(item.href))?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="green" className="hidden sm:flex gap-1 items-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
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
  )
}
