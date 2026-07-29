'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { notificationKeys } from '@/hooks/useNotifications';
import type { Notification } from '@/types/notification';

export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const connectedRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNewNotification = (notification: Notification) => {
      queryClient.setQueriesData(
        { queryKey: notificationKeys.all },
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old;
          const data = old as Record<string, unknown>;
          if ('pages' in data) {
            return {
              ...data,
              pages: (data.pages as Array<{ items: Notification[]; total: number }>).map((page, i) =>
                i === 0
                  ? { ...page, items: [notification, ...page.items], total: page.total + 1 }
                  : page,
              ),
            };
          }
          if ('items' in data) {
            return {
              ...data,
              items: [notification, ...(data.items as Notification[])],
              total: ((data as Record<string, unknown>).total as number) + 1,
            };
          }
          return data;
        },
      );

      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    };

    const onUnreadUpdate = (data: { count: number }) => {
      queryClient.setQueryData(notificationKeys.unreadCount, data);
    };

    if (!connectedRef.current) {
      socket.on('notification:new', onNewNotification);
      socket.on('unread:update', onUnreadUpdate);
      connectedRef.current = true;
    }

    return () => {
      connectedRef.current = false;
      socket.off('notification:new', onNewNotification);
      socket.off('unread:update', onUnreadUpdate);
      disconnectSocket();
    };
  }, [queryClient]);
}
