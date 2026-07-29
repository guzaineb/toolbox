export type NotificationType =
  | 'APPLICATION_SUBMITTED'
  | 'INVITATION_RECEIVED'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_REJECTED'
  | 'MEMBER_JOINED'
  | 'MEMBER_LEFT'
  | 'COHORT_CREATED'
  | 'COHORT_UPDATED'
  | 'APPLICATION_OPEN'
  | 'DOCUMENT_VERIFIED'
  | 'NEW_EVALUATION'
  | 'COACHING_FEEDBACK'
  | 'COACHING_SCHEDULED'
  | 'DOCUMENT_GENERATED'
  | 'DOCUMENT_UPDATED'
  | 'AI_RESPONSE_READY'
  | 'STEP_COMPLETED'
  | 'ASSIGNED_AS_COACH'
  | 'ASSIGNED_AS_JURY'
  | 'EVALUATION_REQUESTED'
  | 'PROJECT_MATCHED'
  | 'PROJECT_UNMATCHED'
  | 'NEW_USER_REGISTERED'
  | 'NEW_INCUBATOR'
  | 'NEW_EXPERT'
  | 'DOCUMENT_PENDING'
  | 'USER_REPORTED'
  | 'CRITICAL_ERROR'

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ResourceType = 'PROJECT' | 'COHORT' | 'INCUBATOR' | 'EVALUATION' | 'COACHING' | 'DOCUMENT' | 'USER' | 'INCUBATOR_MEMBER'

export interface Notification {
  id: string
  user_id: string
  sender_id?: string | null
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  resource_type?: ResourceType | null
  resource_id?: string | null
  link?: string | null
  is_read: boolean
  read_at?: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface NotificationQueryParams {
  unreadOnly?: boolean
  page?: number
  limit?: number
  type?: NotificationType
  search?: string
  sort?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
  archived?: boolean
}

export interface UnreadCountResponse {
  count: number
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  APPLICATION_SUBMITTED: 'Candidature soumise',
  INVITATION_RECEIVED: 'Invitation reçue',
  APPLICATION_ACCEPTED: 'Candidature acceptée',
  APPLICATION_REJECTED: 'Candidature refusée',
  INVITATION_ACCEPTED: 'Invitation acceptée',
  INVITATION_REJECTED: 'Invitation déclinée',
  MEMBER_JOINED: 'Membre rejoint',
  MEMBER_LEFT: 'Membre parti',
  COHORT_CREATED: 'Cohorte créée',
  COHORT_UPDATED: 'Cohorte mise à jour',
  APPLICATION_OPEN: 'Candidatures ouvertes',
  DOCUMENT_VERIFIED: 'Document vérifié',
  NEW_EVALUATION: 'Nouvelle évaluation',
  COACHING_FEEDBACK: 'Feedback coaching',
  COACHING_SCHEDULED: 'Coaching programmé',
  DOCUMENT_GENERATED: 'Document généré',
  DOCUMENT_UPDATED: 'Document mis à jour',
  AI_RESPONSE_READY: 'Réponse IA prête',
  STEP_COMPLETED: 'Étape terminée',
  ASSIGNED_AS_COACH: 'Assigné coach',
  ASSIGNED_AS_JURY: 'Assigné jury',
  EVALUATION_REQUESTED: 'Évaluation demandée',
  PROJECT_MATCHED: 'Projet matché',
  PROJECT_UNMATCHED: 'Projet dématché',
  NEW_USER_REGISTERED: 'Nouvel utilisateur',
  NEW_INCUBATOR: 'Nouvel incubateur',
  NEW_EXPERT: 'Nouvel expert',
  DOCUMENT_PENDING: 'Document en attente',
  USER_REPORTED: 'Utilisateur signalé',
  CRITICAL_ERROR: 'Erreur critique',
}

const priorityColors: Record<NotificationPriority, string> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'amber',
  CRITICAL: 'red',
}

const priorityLabels: Record<NotificationPriority, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  CRITICAL: 'Critique',
}

export const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
  APPLICATION_SUBMITTED: 'blue',
  INVITATION_RECEIVED: 'amber',
  APPLICATION_ACCEPTED: 'green',
  APPLICATION_REJECTED: 'red',
  INVITATION_ACCEPTED: 'green',
  INVITATION_REJECTED: 'red',
  MEMBER_JOINED: 'green',
  MEMBER_LEFT: 'red',
  COHORT_CREATED: 'blue',
  COHORT_UPDATED: 'blue',
  APPLICATION_OPEN: 'green',
  DOCUMENT_VERIFIED: 'green',
  NEW_EVALUATION: 'amber',
  COACHING_FEEDBACK: 'blue',
  COACHING_SCHEDULED: 'blue',
  DOCUMENT_GENERATED: 'green',
  DOCUMENT_UPDATED: 'blue',
  AI_RESPONSE_READY: 'blue',
  STEP_COMPLETED: 'green',
  ASSIGNED_AS_COACH: 'amber',
  ASSIGNED_AS_JURY: 'amber',
  EVALUATION_REQUESTED: 'amber',
  PROJECT_MATCHED: 'green',
  PROJECT_UNMATCHED: 'red',
  NEW_USER_REGISTERED: 'blue',
  NEW_INCUBATOR: 'green',
  NEW_EXPERT: 'blue',
  DOCUMENT_PENDING: 'amber',
  USER_REPORTED: 'red',
  CRITICAL_ERROR: 'red',
}

export function getPriorityColor(priority: NotificationPriority): string {
  return priorityColors[priority]
}

export function getPriorityLabel(priority: NotificationPriority): string {
  return priorityLabels[priority]
}

export function groupByDate(notifications: Notification[]): Map<string, Notification[]> {
  const groups = new Map<string, Notification[]>()
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const n of notifications) {
    const date = new Date(n.created_at)
    let key: string

    if (date.toDateString() === today.toDateString()) {
      key = "Aujourd'hui"
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Hier'
    } else {
      key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    const group = groups.get(key) ?? []
    group.push(n)
    groups.set(key, group)
  }

  return groups
}

export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  APPLICATION_SUBMITTED: 'FilePlus',
  INVITATION_RECEIVED: 'Mail',
  APPLICATION_ACCEPTED: 'CheckCircle',
  APPLICATION_REJECTED: 'XCircle',
  INVITATION_ACCEPTED: 'CheckCircle',
  INVITATION_REJECTED: 'XCircle',
  MEMBER_JOINED: 'UserPlus',
  MEMBER_LEFT: 'UserX',
  COHORT_CREATED: 'Layers',
  COHORT_UPDATED: 'RefreshCw',
  APPLICATION_OPEN: 'DoorOpen',
  DOCUMENT_VERIFIED: 'ShieldCheck',
  NEW_EVALUATION: 'Star',
  COACHING_FEEDBACK: 'MessageSquare',
  COACHING_SCHEDULED: 'Calendar',
  DOCUMENT_GENERATED: 'FileText',
  DOCUMENT_UPDATED: 'FileEdit',
  AI_RESPONSE_READY: 'Sparkles',
  STEP_COMPLETED: 'CheckCircle',
  ASSIGNED_AS_COACH: 'UserCheck',
  ASSIGNED_AS_JURY: 'Scale',
  EVALUATION_REQUESTED: 'ClipboardList',
  PROJECT_MATCHED: 'Link',
  PROJECT_UNMATCHED: 'Unlink',
  NEW_USER_REGISTERED: 'UserPlus',
  NEW_INCUBATOR: 'Building',
  NEW_EXPERT: 'Award',
  DOCUMENT_PENDING: 'Clock',
  USER_REPORTED: 'AlertTriangle',
  CRITICAL_ERROR: 'AlertOctagon',
}
