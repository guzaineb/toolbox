'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Bell, Archive, Trash2, RotateCcw, Link as LinkIcon } from 'lucide-react';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_TYPE_ICONS,
  getPriorityColor,
  getPriorityLabel,
} from '@/types/notification';
import { Badge, Button, Card, ErrorAlert } from '@/components/shared/ui';
import { useNotificationDetail, useMarkAsRead, useArchiveNotification, useRestoreNotification, useDeleteNotification, notificationKeys } from '@/hooks/useNotifications';
import { cn, formatDate } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  FilePlus: <Bell size={20} />,
  Mail: <Bell size={20} />,
  CheckCircle: <Bell size={20} />,
  XCircle: <Bell size={20} />,
  UserPlus: <Bell size={20} />,
  UserX: <Bell size={20} />,
  Layers: <Bell size={20} />,
  RefreshCw: <Bell size={20} />,
  DoorOpen: <Bell size={20} />,
  ShieldCheck: <Bell size={20} />,
  Star: <Bell size={20} />,
  MessageSquare: <Bell size={20} />,
  Calendar: <Bell size={20} />,
  FileText: <Bell size={20} />,
  FileEdit: <Bell size={20} />,
  Sparkles: <Bell size={20} />,
  UserCheck: <Bell size={20} />,
  Scale: <Bell size={20} />,
  ClipboardList: <Bell size={20} />,
  Link: <LinkIcon size={20} />,
  Unlink: <Bell size={20} />,
  Building: <Bell size={20} />,
  Award: <Bell size={20} />,
  Clock: <Bell size={20} />,
  AlertTriangle: <Bell size={20} />,
  AlertOctagon: <Bell size={20} />,
};

function getNotificationIcon(type: string): React.ReactNode {
  const iconName = NOTIFICATION_TYPE_ICONS[type] ?? 'Bell';
  return iconMap[iconName] ?? <Bell size={20} />;
}

function getBadgeVariant(type: string): 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'secondary' {
  const color = NOTIFICATION_TYPE_COLORS[type];
  if (color === 'green') return 'green';
  if (color === 'red') return 'red';
  if (color === 'amber') return 'amber';
  return 'blue';
}

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const markAsReadMut = useMarkAsRead();
  const archiveMut = useArchiveNotification();
  const restoreMut = useRestoreNotification();
  const deleteMut = useDeleteNotification();

  const { data: notification, isLoading, isError } = useNotificationDetail(id);

  useEffect(() => {
    if (notification && !notification.is_read) {
      markAsReadMut.mutate(id);
    }
  }, [notification?.id, notification?.is_read]);

  const handleArchive = async () => {
    await archiveMut.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    router.push('/dashboard/notifications');
  };

  const handleRestore = async () => {
    await restoreMut.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    router.push('/dashboard/notifications');
  };

  const handleDelete = async () => {
    await deleteMut.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    router.push('/dashboard/notifications');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link
        href="/dashboard/notifications"
        className="inline-flex items-center gap-2 text-sm text-ink3 hover:text-ink mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux notifications
      </Link>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-moss" />
        </div>
      )}

      {isError && (
        <Card className="p-6">
          <ErrorAlert message="Impossible de charger cette notification." />
        </Card>
      )}

      {notification && (
        <Card className="p-[24px_28px] overflow-hidden">
          <div className="flex items-start gap-4 mb-6">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                (NOTIFICATION_TYPE_COLORS[notification.type] ?? 'blue') === 'green' && 'bg-green-100 text-green-600',
                (NOTIFICATION_TYPE_COLORS[notification.type] ?? 'blue') === 'red' && 'bg-red-100 text-red',
                (NOTIFICATION_TYPE_COLORS[notification.type] ?? 'blue') === 'amber' && 'bg-amber-100 text-amber',
                (NOTIFICATION_TYPE_COLORS[notification.type] ?? 'blue') === 'blue' && 'bg-blue-100 text-blue',
              )}
            >
              {getNotificationIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] font-bold text-ink mb-2">{notification.title}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getBadgeVariant(notification.type)}>
                  {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
                </Badge>
                <Badge variant={getPriorityColor(notification.priority) === 'red' ? 'red' : getPriorityColor(notification.priority) === 'amber' ? 'amber' : getPriorityColor(notification.priority) === 'gray' ? 'gray' : 'blue'}>
                  {getPriorityLabel(notification.priority)}
                </Badge>
                <span className="text-[11px] text-ink3">{formatDate(notification.created_at, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="bg-bg rounded-lg p-4 mb-6">
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{notification.message}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3 mb-1">Ressource</div>
              <div className="text-[13px] text-ink">
                {notification.resource_type ? `${notification.resource_type}${notification.resource_id ? ` · ${notification.resource_id.slice(0, 8)}…` : ''}` : '—'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3 mb-1">Expéditeur</div>
              <div className="text-[13px] text-ink">{notification.sender_id ? notification.sender_id.slice(0, 8) + '…' : '—'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-4">
            {notification.link && (
              <Link href={notification.link} className="mr-auto">
                <Button variant="primary" size="sm">
                  <LinkIcon size={14} />
                  Voir la ressource
                </Button>
              </Link>
            )}

            {notification.is_archived ? (
              <Button variant="outline" size="sm" onClick={handleRestore}>
                <RotateCcw size={14} />
                Restaurer
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleArchive}>
                <Archive size={14} />
                Archiver
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red hover:bg-red-light">
              <Trash2 size={14} />
              Supprimer
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
