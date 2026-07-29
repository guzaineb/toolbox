'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotificationsList, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications'
import { NOTIFICATION_TYPE_COLORS } from '@/types/notification'

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

function NotificationItem({
  notification,
  onRead,
}: {
  notification: { id: string; title: string; message: string; type: string; is_read: boolean; created_at: string }
  onRead: (id: string) => void
}) {
  const color = NOTIFICATION_TYPE_COLORS[notification.type] ?? 'blue'
  const dotColor =
    color === 'green' ? 'bg-green-500' :
    color === 'red' ? 'bg-red' :
    color === 'amber' ? 'bg-amber' :
    'bg-moss'

  return (
    <div
      className={cn(
        'px-[14px] py-[11px] border-b border-border last:border-b-0 cursor-pointer transition-colors',
        notification.is_read ? 'bg-transparent hover:bg-surface-2' : 'bg-moss-light/30 hover:bg-moss-light/50',
      )}
      onClick={() => {
        if (!notification.is_read) onRead(notification.id)
      }}
    >
      <div className="flex items-start gap-[10px]">
        <div className={cn(
          'mt-0.5 w-[6px] h-[6px] rounded-full flex-shrink-0',
          notification.is_read ? 'bg-transparent' : dotColor,
        )} />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-ink truncate">{notification.title}</div>
          <div className="text-[11px] text-ink3 leading-relaxed mt-0.5 line-clamp-2">{notification.message}</div>
          <div className="text-[10px] text-ink3 mt-1">{getRelativeTime(notification.created_at)}</div>
        </div>
      </div>
    </div>
  )
}

export function NotificationsBell() {
  const { data } = useNotificationsList({ limit: 8, archived: false })
  const { data: unreadData } = useUnreadCount()
  const markAsReadMut = useMarkAsRead()
  const markAllAsReadMut = useMarkAllAsRead()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const notifications = data?.items ?? []
  const unreadCount = unreadData?.count ?? 0

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-moss-light transition-colors"
      >
        <Bell size={18} className="text-ink2" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red text-white text-[9px] font-bold px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-surface border border-border rounded-[14px] shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-[14px] py-[11px] border-b border-border bg-surface-2">
            <span className="font-syne text-[13px] font-bold text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMut.mutate()}
                className="flex items-center gap-1 text-[11px] text-moss hover:text-moss-mid font-medium transition-colors"
              >
                <CheckCheck size={13} />
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-[14px] py-8 text-center text-[12px] text-ink3">
                Aucune notification
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={(id) => markAsReadMut.mutate(id)}
                />
              ))
            )}
          </div>

          <Link
            href="/dashboard/notifications"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center px-[14px] py-[11px] border-t border-border text-[12px] font-medium text-moss hover:bg-moss-light transition-colors"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  )
}
