/* =========================================================
   ENUMS
========================================================= */

export type NotificationType =
  | 'APPLICATION_SUBMITTED'
  | 'INVITATION_RECEIVED'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_REJECTED'

/* =========================================================
   BASE ENTITY
========================================================= */

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  link?: string
  created_at: string
  updated_at: string
}

/* =========================================================
   LABELS & COLORS
========================================================= */

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  APPLICATION_SUBMITTED: 'Candidature soumise',
  INVITATION_RECEIVED: 'Invitation reçue',
  APPLICATION_ACCEPTED: 'Candidature acceptée',
  APPLICATION_REJECTED: 'Candidature refusée',
  INVITATION_ACCEPTED: 'Invitation acceptée',
  INVITATION_REJECTED: 'Invitation déclinée',
}

export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  APPLICATION_SUBMITTED: 'blue',
  INVITATION_RECEIVED: 'amber',
  APPLICATION_ACCEPTED: 'green',
  APPLICATION_REJECTED: 'red',
  INVITATION_ACCEPTED: 'green',
  INVITATION_REJECTED: 'red',
}

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  APPLICATION_SUBMITTED: 'file-plus',
  INVITATION_RECEIVED: 'mail',
  APPLICATION_ACCEPTED: 'check-circle',
  APPLICATION_REJECTED: 'x-circle',
  INVITATION_ACCEPTED: 'check-circle',
  INVITATION_REJECTED: 'x-circle',
}
