'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCheck,
  CheckCircle,
  XCircle,
  Mail,
  FilePlus,
  Search,
  Archive,
  Trash2,
  RotateCcw,
  ArrowUpDown,
  UserPlus,
  UserX,
  Layers,
  RefreshCw,
  DoorOpen,
  ShieldCheck,
  Star,
  MessageSquare,
  Calendar,
  FileText,
  FileEdit,
  Sparkles,
  UserCheck,
  Scale,
  ClipboardList,
  Link as LinkIcon,
  Unlink,
  Building,
  Award,
  Clock,
  AlertTriangle,
  AlertOctagon,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useNotificationsInfinite,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useArchiveNotification,
  useRestoreNotification,
  useDeleteNotification,
} from '@/hooks/useNotifications'
import {
  Badge,
  Button,
  Card,
  Input,
  TabNav,
} from '@/components/shared/ui'
import {
  Notification,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_TYPE_ICONS,
  getPriorityColor,
  getPriorityLabel,
  groupByDate,
} from '@/types/notification'

type FilterTab = 'all' | 'unread' | 'archived'

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin}min`
  if (diffH < 24) return `il y a ${diffH}h`
  if (diffD < 7) return `il y a ${diffD}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const iconMap: Record<string, React.ReactNode> = {
  FilePlus: <FilePlus size={16} />,
  Mail: <Mail size={16} />,
  CheckCircle: <CheckCircle size={16} />,
  XCircle: <XCircle size={16} />,
  UserPlus: <UserPlus size={16} />,
  UserX: <UserX size={16} />,
  Layers: <Layers size={16} />,
  RefreshCw: <RefreshCw size={16} />,
  DoorOpen: <DoorOpen size={16} />,
  ShieldCheck: <ShieldCheck size={16} />,
  Star: <Star size={16} />,
  MessageSquare: <MessageSquare size={16} />,
  Calendar: <Calendar size={16} />,
  FileText: <FileText size={16} />,
  FileEdit: <FileEdit size={16} />,
  Sparkles: <Sparkles size={16} />,
  UserCheck: <UserCheck size={16} />,
  Scale: <Scale size={16} />,
  ClipboardList: <ClipboardList size={16} />,
  Link: <LinkIcon size={16} />,
  Unlink: <Unlink size={16} />,
  Building: <Building size={16} />,
  Award: <Award size={16} />,
  Clock: <Clock size={16} />,
  AlertTriangle: <AlertTriangle size={16} />,
  AlertOctagon: <AlertOctagon size={16} />,
}

function getNotificationIcon(type: string): React.ReactNode {
  const iconName = NOTIFICATION_TYPE_ICONS[type] ?? 'Bell'
  return iconMap[iconName] ?? <Bell size={16} />
}

function getBadgeVariant(type: string): 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'secondary' {
  const color = NOTIFICATION_TYPE_COLORS[type]
  if (color === 'green') return 'green'
  if (color === 'red') return 'red'
  if (color === 'amber') return 'amber'
  return 'blue'
}

function getPriorityBadgeVariant(priority: string): 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'secondary' {
  const c = getPriorityColor(priority as any)
  if (c === 'red') return 'red'
  if (c === 'amber') return 'amber'
  if (c === 'gray') return 'gray'
  return 'blue'
}

function NotificationCard({
  notification,
  onRead,
  onArchive,
  onRestore,
  onDelete,
}: {
  notification: Notification
  onRead: (id: string) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const typeColor = NOTIFICATION_TYPE_COLORS[notification.type] ?? 'blue'
  const iconColorClass =
    typeColor === 'green' ? 'text-green-600' :
    typeColor === 'red' ? 'text-red' :
    typeColor === 'amber' ? 'text-amber' :
    'text-blue'

  return (
    <Card
      className={cn(
        'p-[14px_18px] transition-colors relative',
        !notification.is_read && 'border-l-[3px] border-l-moss',
        notification.is_archived && 'opacity-70',
      )}
    >
      <div className="flex items-start gap-[12px]">
        <div className={cn('mt-0.5 flex-shrink-0', iconColorClass)}>
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!notification.is_read && (
              <span className="w-[6px] h-[6px] rounded-full bg-moss flex-shrink-0" />
            )}
            <span className={cn('text-[13px] font-semibold', !notification.is_read ? 'text-ink' : 'text-ink2')}>
              {notification.title}
            </span>
          </div>

          <p className="text-[12px] text-ink3 leading-relaxed">{notification.message}</p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] text-ink3">{getRelativeTime(notification.created_at)}</span>
            <Badge variant={getBadgeVariant(notification.type)}>
              {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(notification.priority)}>
              {getPriorityLabel(notification.priority)}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {notification.link && (
            <Link
              href={notification.link}
              className="p-1.5 rounded-lg hover:bg-moss-light text-ink3 hover:text-moss transition-colors"
              title="Voir la ressource"
            >
              <LinkIcon size={14} />
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-surface-2 text-ink3 hover:text-ink transition-colors"
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-[160px] bg-surface border border-border rounded-[10px] shadow-lg overflow-hidden">
                  {!notification.is_read ? (
                    <button
                      onClick={() => { onRead(notification.id); setMenuOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-ink hover:bg-moss-light transition-colors text-left"
                    >
                      <CheckCircle size={13} /> Marquer lu
                    </button>
                  ) : null}

                  {notification.is_archived ? (
                    <button
                      onClick={() => { onRestore(notification.id); setMenuOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-ink hover:bg-moss-light transition-colors text-left"
                    >
                      <RotateCcw size={13} /> Restaurer
                    </button>
                  ) : (
                    <button
                      onClick={() => { onArchive(notification.id); setMenuOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-ink hover:bg-moss-light transition-colors text-left"
                    >
                      <Archive size={13} /> Archiver
                    </button>
                  )}

                  <button
                    onClick={() => { onDelete(notification.id); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[11px] text-red hover:bg-red-light transition-colors text-left"
                  >
                    <Trash2 size={13} /> Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  const queryParams = useMemo(() => ({
    unreadOnly: filter === 'unread' ? true : undefined,
    archived: filter === 'archived' ? true : undefined,
    search: search || undefined,
    sort: sortOrder,
    limit: 20 as const,
  }), [filter, search, sortOrder])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useNotificationsInfinite(queryParams)

  const { data: unreadData } = useUnreadCount()
  const markAsReadMut = useMarkAsRead()
  const markAllAsReadMut = useMarkAllAsRead()
  const archiveMut = useArchiveNotification()
  const restoreMut = useRestoreNotification()
  const deleteMut = useDeleteNotification()

  const allNotifications = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  )

  const totalCount = data?.pages[0]?.total ?? 0
  const unreadCount = unreadData?.count ?? 0

  const grouped = useMemo(() => groupByDate(allNotifications), [allNotifications])

  const todayCount = useMemo(() => {
    const today = new Date().toDateString()
    return allNotifications.filter((n) => new Date(n.created_at).toDateString() === today).length
  }, [allNotifications])

  const handleCardClick = (notification: Notification) => {
    if (!notification.is_read) markAsReadMut.mutate(notification.id)
    if (notification.link) {
      window.location.href = notification.link
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">Notifications</h1>
          <p className="text-[12px] text-ink3">
            {unreadCount > 0
              ? `${unreadCount} non lue(s) · ${totalCount} totale(s)`
              : 'Toutes les notifications sont lues'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            title="Inverser l'ordre"
          >
            <ArrowUpDown size={13} />
            {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsReadMut.mutate()}>
              <CheckCheck size={13} /> Tout marquer lu
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3" />
        <Input
          placeholder="Rechercher dans les notifications…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <TabNav
        tabs={[
          { id: 'all', label: `Toutes (${totalCount})` },
          { id: 'unread', label: `Non lues (${unreadCount})` },
          { id: 'archived', label: 'Archivées' },
        ]}
        active={filter}
        onChange={(id) => setFilter(id as FilterTab)}
      />

      {/* Today badge */}
      {todayCount > 0 && filter !== 'archived' && (
        <div className="text-[11px] text-ink3 font-medium">
          {todayCount} nouvelle(s) aujourd&apos;hui
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[80px] bg-border rounded-[14px] animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <Card className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-red-light text-red flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Erreur de chargement</p>
          <p className="text-[12px] text-ink3">{(error as Error)?.message ?? 'Une erreur est survenue'}</p>
        </Card>
      ) : allNotifications.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <Bell size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">
            {search
              ? 'Aucun résultat'
              : filter === 'unread'
                ? 'Aucune notification non lue'
                : filter === 'archived'
                  ? 'Aucune notification archivée'
                  : 'Aucune notification'}
          </p>
          <p className="text-[12px] text-ink3">
            {search
              ? 'Essayez d\'autres termes de recherche.'
              : filter === 'unread'
                ? 'Toutes vos notifications ont été lues.'
                : 'Vous recevrez ici les notifications liées à vos activités.'}
          </p>
        </Card>
      ) : (
        <>
          {/* Grouped notifications */}
          <div className="space-y-[10px]">
            {Array.from(grouped.entries()).map(([dateLabel, notifications]) => (
              <div key={dateLabel}>
                <div className="text-[11px] font-semibold text-ink3 uppercase tracking-[0.06em] mb-[6px] px-1">
                  {dateLabel}
                </div>
                <div className="space-y-[6px]">
                  {notifications.map((n) => (
                    <NotificationCard
                      key={n.id}
                      notification={n}
                      onRead={(id) => markAsReadMut.mutate(id)}
                      onArchive={(id) => archiveMut.mutate(id)}
                      onRestore={(id) => restoreMut.mutate(id)}
                      onDelete={(id) => deleteMut.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Load more */}
          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Chargement…' : 'Charger plus'}
              </Button>
            </div>
          )}

          {/* Count summary */}
          <div className="text-[11px] text-ink3 text-center pt-1">
            {allNotifications.length} notification{allNotifications.length > 1 ? 's' : ''} affichée{allNotifications.length > 1 ? 's' : ''}
            {totalCount > allNotifications.length && ` sur ${totalCount}`}
          </div>
        </>
      )}
    </div>
  )
}
