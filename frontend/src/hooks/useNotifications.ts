'use client';

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  infiniteQueryOptions,
  queryOptions,
} from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import type { Notification, NotificationQueryParams } from '@/types/notification';

const NOTIFICATIONS_KEY = 'notifications';
const UNREAD_COUNT_KEY = 'unread-count';

// ─── Query key factory ───────────────────────────────────
export const notificationKeys = {
  all: [NOTIFICATIONS_KEY] as const,
  list: (params?: NotificationQueryParams) => [NOTIFICATIONS_KEY, 'list', params] as const,
  detail: (id: string) => [NOTIFICATIONS_KEY, 'detail', id] as const,
  unreadCount: [NOTIFICATIONS_KEY, UNREAD_COUNT_KEY] as const,
};

// ─── Infinite query options for the list page ─────────────
export function useNotificationsInfinite(params: Omit<NotificationQueryParams, 'page'>) {
  return useInfiniteQuery(
    infiniteQueryOptions({
      queryKey: notificationKeys.list(params),
      queryFn: async ({ pageParam = 1 }) => {
        const res = await notificationService.getAll({ ...params, page: pageParam, limit: params.limit ?? 20 });
        return res;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages) return lastPage.page + 1;
        return undefined;
      },
    }),
  );
}

// ─── Single page query (for bell dropdown — first 8) ──────
export function useNotificationsList(params?: NotificationQueryParams) {
  return useQuery(
    queryOptions({
      queryKey: notificationKeys.list(params),
      queryFn: () => notificationService.getAll({ ...params, page: 1, limit: params?.limit ?? 50 }),
    }),
  );
}

// ─── Unread count (polling every 60s as fallback; real-time via socket) ──
export function useUnreadCount() {
  return useQuery(
    queryOptions({
      queryKey: notificationKeys.unreadCount,
      queryFn: () => notificationService.getUnreadCount(),
      refetchInterval: 60_000,
    }),
  );
}

// ─── Detail ──────────────────────────────────────────────
export function useNotificationDetail(id: string) {
  return useQuery(
    queryOptions({
      queryKey: notificationKeys.detail(id),
      queryFn: () => notificationService.getOne(id),
      enabled: !!id,
    }),
  );
}

// ─── Mutations ───────────────────────────────────────────
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_KEY] });
      const previousData = queryClient.getQueriesData({ queryKey: [NOTIFICATIONS_KEY] });

      queryClient.setQueriesData(
        { queryKey: [NOTIFICATIONS_KEY, 'list'] },
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old;
          const data = old as Record<string, unknown>;
          if ('pages' in data) {
            return {
              ...data,
              pages: (data.pages as Array<{ items: Notification[] }>).map((page) => ({
                ...page,
                items: page.items.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
              })),
            };
          }
          if ('items' in data) {
            return {
              ...data,
              items: (data.items as Notification[]).map((n) =>
                n.id === id ? { ...n, is_read: true } : n,
              ),
            };
          }
          return data;
        },
      );

      queryClient.setQueryData(notificationKeys.unreadCount, (old: unknown) => {
        if (!old || typeof old !== 'object') return { count: 0 };
        const c = ((old as Record<string, unknown>).count as number) ?? 0;
        return { count: Math.max(0, c - 1) };
      });

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_KEY] });

      queryClient.setQueriesData(
        { queryKey: [NOTIFICATIONS_KEY, 'list'] },
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old;
          const data = old as Record<string, unknown>;
          if ('pages' in data) {
            return {
              ...data,
              pages: (data.pages as Array<{ items: Notification[] }>).map((page) => ({
                ...page,
                items: page.items.map((n) => ({ ...n, is_read: true })),
              })),
            };
          }
          if ('items' in data) {
            return {
              ...data,
              items: (data.items as Notification[]).map((n) => ({ ...n, is_read: true })),
            };
          }
          return data;
        },
      );

      queryClient.setQueryData(notificationKeys.unreadCount, () => ({ count: 0 }));

      return { previousCount: undefined };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.archive(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_KEY] });
      const previousData = queryClient.getQueriesData({ queryKey: [NOTIFICATIONS_KEY] });

      queryClient.setQueriesData(
        { queryKey: [NOTIFICATIONS_KEY, 'list'] },
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old;
          const data = old as Record<string, unknown>;
          if ('pages' in data) {
            return {
              ...data,
              pages: (data.pages as Array<{ items: Notification[] }>).map((page) => ({
                ...page,
                items: page.items.map((n) => (n.id === id ? { ...n, is_archived: true } : n)),
              })),
            };
          }
          if ('items' in data) {
            return {
              ...data,
              items: (data.items as Notification[]).map((n) =>
                n.id === id ? { ...n, is_archived: true } : n,
              ),
            };
          }
          return data;
        },
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useRestoreNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.restore(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_KEY] });
      const previousData = queryClient.getQueriesData({ queryKey: [NOTIFICATIONS_KEY] });

      queryClient.setQueriesData(
        { queryKey: [NOTIFICATIONS_KEY, 'list'] },
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old;
          const data = old as Record<string, unknown>;
          if ('pages' in data) {
            return {
              ...data,
              pages: (data.pages as Array<{ items: Notification[] }>).map((page) => ({
                ...page,
                items: page.items.map((n) => (n.id === id ? { ...n, is_archived: false } : n)),
              })),
            };
          }
          if ('items' in data) {
            return {
              ...data,
              items: (data.items as Notification[]).map((n) =>
                n.id === id ? { ...n, is_archived: false } : n,
              ),
            };
          }
          return data;
        },
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_KEY] });
      const previousData = queryClient.getQueriesData({ queryKey: [NOTIFICATIONS_KEY] });

      queryClient.setQueriesData(
        { queryKey: [NOTIFICATIONS_KEY, 'list'] },
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old;
          const data = old as Record<string, unknown>;
          if ('pages' in data) {
            return {
              ...data,
              pages: (data.pages as Array<{ items: Notification[] }>).map((page) => ({
                ...page,
                items: page.items.filter((n) => n.id !== id),
              })),
            };
          }
          if ('items' in data) {
            return {
              ...data,
              items: (data.items as Notification[]).filter((n) => n.id !== id),
            };
          }
          return data;
        },
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}
