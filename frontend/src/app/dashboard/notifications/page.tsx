'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, CheckCircle, XCircle, Mail, FilePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/useNotifications'
import { Badge, Button, Card, ErrorAlert, TabNav } from '@/components/shared/ui'
import { Notification, NOTIFICATION_TYPE_LABELS, NOTIFICATION_TYPE_COLORS } from '@/types/notification'

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
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'APPLICATION_SUBMITTED':
      return <FilePlus size={16} className="text-blue" />
    case 'INVITATION_RECEIVED':
      return <Mail size={16} className="text-amber" />
    case 'APPLICATION_ACCEPTED':
    case 'INVITATION_ACCEPTED':
      return <CheckCircle size={16} className="text-green-600" />
    case 'APPLICATION_REJECTED':
    case 'INVITATION_REJECTED':
      return <XCircle size={16} className="text-red" />
    default:
      return <Bell size={16} className="text-ink3" />
  }
}

function getBadgeVariant(type: Notification['type']) {
  const color = NOTIFICATION_TYPE_COLORS[type]
  if (color === 'green') return 'green'
  if (color === 'red') return 'red'
  if (color === 'amber') return 'amber'
  return 'blue'
}

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead, refresh } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">Notifications</h1>
          <p className="text-[12px] text-ink3">
            {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Toutes les notifications sont lues'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck size={13} /> Tout marquer lu
          </Button>
        )}
      </div>

      <TabNav
        tabs={[
          { id: 'all', label: `Toutes (${notifications.length})` },
          { id: 'unread', label: `Non lues (${unreadCount})` },
        ]}
        active={filter}
        onChange={(id) => setFilter(id as 'all' | 'unread')}
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[72px] bg-border rounded-[14px] animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <Bell size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">
            {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
          </p>
          <p className="text-[12px] text-ink3">
            {filter === 'unread'
              ? 'Toutes vos notifications ont été lues.'
              : 'Vous recevrez ici les notifications liées à vos activités.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-[6px]">
          {filteredNotifications.map((n) => (
            <Card
              key={n.id}
              className={cn(
                'p-[14px_18px] cursor-pointer transition-colors',
                !n.is_read && 'border-l-[3px] border-l-moss',
              )}
              onClick={() => {
                if (!n.is_read) markAsRead(n.id)
                if (n.link) {
                  window.location.href = n.link
                }
              }}
            >
              <div className="flex items-start gap-[12px]">
                <div className="mt-0.5 flex-shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-[13px] font-semibold', !n.is_read ? 'text-ink' : 'text-ink2')}>
                      {n.title}
                    </span>
                    {!n.is_read && (
                      <span className="w-[6px] h-[6px] rounded-full bg-moss flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[12px] text-ink3 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-ink3">{getRelativeTime(n.created_at)}</span>
                    <Badge variant={getBadgeVariant(n.type)}>
                      {NOTIFICATION_TYPE_LABELS[n.type]}
                    </Badge>
                    {n.link && (
                      <span className="text-[10px] text-moss font-medium">Voir →</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
