import { NotificationType, NotificationPriority } from '@prisma/client';
import { NotificationEvent } from './notification-event.enum';

export const NOTIFICATION_EVENT_MAP: Record<
  string,
  {
    type: NotificationType;
    priority: NotificationPriority;
    category: 'coaching' | 'evaluation' | 'cohort' | 'invitation' | 'document' | 'ai' | 'admin';
    requiresEmail: boolean;
  }
> = {
  [NotificationEvent.APPLICATION_SUBMITTED]: {
    type: NotificationType.APPLICATION_SUBMITTED,
    priority: NotificationPriority.MEDIUM,
    category: 'cohort',
    requiresEmail: false,
  },
  [NotificationEvent.APPLICATION_WITHDRAWN]: {
    type: NotificationType.APPLICATION_REJECTED,
    priority: NotificationPriority.LOW,
    category: 'cohort',
    requiresEmail: false,
  },
  [NotificationEvent.INVITATION_SENT]: {
    type: NotificationType.INVITATION_RECEIVED,
    priority: NotificationPriority.HIGH,
    category: 'invitation',
    requiresEmail: true,
  },
  [NotificationEvent.APPLICATION_ACCEPTED]: {
    type: NotificationType.APPLICATION_ACCEPTED,
    priority: NotificationPriority.HIGH,
    category: 'invitation',
    requiresEmail: true,
  },
  [NotificationEvent.APPLICATION_REJECTED]: {
    type: NotificationType.APPLICATION_REJECTED,
    priority: NotificationPriority.MEDIUM,
    category: 'invitation',
    requiresEmail: true,
  },
  [NotificationEvent.INVITATION_ACCEPTED]: {
    type: NotificationType.INVITATION_ACCEPTED,
    priority: NotificationPriority.MEDIUM,
    category: 'invitation',
    requiresEmail: true,
  },
  [NotificationEvent.INVITATION_REJECTED]: {
    type: NotificationType.INVITATION_REJECTED,
    priority: NotificationPriority.LOW,
    category: 'invitation',
    requiresEmail: false,
  },
  [NotificationEvent.MEMBER_JOINED]: {
    type: NotificationType.MEMBER_JOINED,
    priority: NotificationPriority.MEDIUM,
    category: 'cohort',
    requiresEmail: false,
  },
  [NotificationEvent.MEMBER_INVITED]: {
    type: NotificationType.INVITATION_RECEIVED,
    priority: NotificationPriority.MEDIUM,
    category: 'invitation',
    requiresEmail: true,
  },
  [NotificationEvent.MEMBER_UPDATED]: {
    type: NotificationType.MEMBER_JOINED,
    priority: NotificationPriority.LOW,
    category: 'cohort',
    requiresEmail: false,
  },
  [NotificationEvent.MEMBER_LEFT]: {
    type: NotificationType.MEMBER_LEFT,
    priority: NotificationPriority.LOW,
    category: 'cohort',
    requiresEmail: false,
  },
  [NotificationEvent.COHORT_CREATED]: {
    type: NotificationType.COHORT_CREATED,
    priority: NotificationPriority.MEDIUM,
    category: 'cohort',
    requiresEmail: false,
  },
  [NotificationEvent.COHORT_UPDATED]: {
    type: NotificationType.COHORT_UPDATED,
    priority: NotificationPriority.LOW,
    category: 'cohort',
    requiresEmail: false,
  },
  [NotificationEvent.APPLICATION_OPEN]: {
    type: NotificationType.APPLICATION_OPEN,
    priority: NotificationPriority.MEDIUM,
    category: 'cohort',
    requiresEmail: false,
  },
  [NotificationEvent.INCUBATOR_STATUS_CHANGED]: {
    type: NotificationType.COHORT_UPDATED,
    priority: NotificationPriority.MEDIUM,
    category: 'cohort',
    requiresEmail: false,
  },
  [NotificationEvent.PROJECT_CREATED]: {
    type: NotificationType.STEP_COMPLETED,
    priority: NotificationPriority.LOW,
    category: 'coaching',
    requiresEmail: false,
  },
  [NotificationEvent.DOCUMENT_VERIFIED]: {
    type: NotificationType.DOCUMENT_VERIFIED,
    priority: NotificationPriority.HIGH,
    category: 'document',
    requiresEmail: true,
  },
  [NotificationEvent.NEW_EVALUATION]: {
    type: NotificationType.NEW_EVALUATION,
    priority: NotificationPriority.HIGH,
    category: 'evaluation',
    requiresEmail: false,
  },
  [NotificationEvent.COACHING_SCHEDULED]: {
    type: NotificationType.COACHING_SCHEDULED,
    priority: NotificationPriority.MEDIUM,
    category: 'coaching',
    requiresEmail: false,
  },
  [NotificationEvent.COACHING_FEEDBACK]: {
    type: NotificationType.COACHING_FEEDBACK,
    priority: NotificationPriority.MEDIUM,
    category: 'coaching',
    requiresEmail: false,
  },
  [NotificationEvent.DOCUMENT_GENERATED]: {
    type: NotificationType.DOCUMENT_GENERATED,
    priority: NotificationPriority.LOW,
    category: 'document',
    requiresEmail: false,
  },
  [NotificationEvent.DOCUMENT_UPDATED]: {
    type: NotificationType.DOCUMENT_UPDATED,
    priority: NotificationPriority.LOW,
    category: 'document',
    requiresEmail: false,
  },
  [NotificationEvent.AI_RESPONSE_READY]: {
    type: NotificationType.AI_RESPONSE_READY,
    priority: NotificationPriority.LOW,
    category: 'ai',
    requiresEmail: false,
  },
  [NotificationEvent.STEP_COMPLETED]: {
    type: NotificationType.STEP_COMPLETED,
    priority: NotificationPriority.LOW,
    category: 'coaching',
    requiresEmail: false,
  },
  [NotificationEvent.ASSIGNED_AS_COACH]: {
    type: NotificationType.ASSIGNED_AS_COACH,
    priority: NotificationPriority.HIGH,
    category: 'coaching',
    requiresEmail: true,
  },
  [NotificationEvent.ASSIGNED_AS_JURY]: {
    type: NotificationType.ASSIGNED_AS_JURY,
    priority: NotificationPriority.HIGH,
    category: 'evaluation',
    requiresEmail: true,
  },
  [NotificationEvent.EVALUATION_REQUESTED]: {
    type: NotificationType.EVALUATION_REQUESTED,
    priority: NotificationPriority.HIGH,
    category: 'evaluation',
    requiresEmail: false,
  },
  [NotificationEvent.PROJECT_MATCHED]: {
    type: NotificationType.PROJECT_MATCHED,
    priority: NotificationPriority.MEDIUM,
    category: 'coaching',
    requiresEmail: false,
  },
  [NotificationEvent.PROJECT_UNMATCHED]: {
    type: NotificationType.PROJECT_UNMATCHED,
    priority: NotificationPriority.LOW,
    category: 'coaching',
    requiresEmail: false,
  },
  [NotificationEvent.NEW_USER_REGISTERED]: {
    type: NotificationType.NEW_USER_REGISTERED,
    priority: NotificationPriority.LOW,
    category: 'admin',
    requiresEmail: false,
  },
  [NotificationEvent.NEW_INCUBATOR]: {
    type: NotificationType.NEW_INCUBATOR,
    priority: NotificationPriority.MEDIUM,
    category: 'admin',
    requiresEmail: false,
  },
  [NotificationEvent.NEW_EXPERT]: {
    type: NotificationType.NEW_EXPERT,
    priority: NotificationPriority.LOW,
    category: 'admin',
    requiresEmail: false,
  },
  [NotificationEvent.PASSWORD_RESET_REQUESTED]: {
    type: NotificationType.STEP_COMPLETED,
    priority: NotificationPriority.LOW,
    category: 'coaching',
    requiresEmail: false,
  },
  [NotificationEvent.PASSWORD_RESET_COMPLETED]: {
    type: NotificationType.STEP_COMPLETED,
    priority: NotificationPriority.LOW,
    category: 'coaching',
    requiresEmail: false,
  },
  [NotificationEvent.USER_REPORTED]: {
    type: NotificationType.USER_REPORTED,
    priority: NotificationPriority.HIGH,
    category: 'admin',
    requiresEmail: true,
  },
  [NotificationEvent.CRITICAL_ERROR]: {
    type: NotificationType.CRITICAL_ERROR,
    priority: NotificationPriority.CRITICAL,
    category: 'admin',
    requiresEmail: true,
  },
  [NotificationEvent.DOCUMENT_PENDING]: {
    type: NotificationType.DOCUMENT_PENDING,
    priority: NotificationPriority.MEDIUM,
    category: 'document',
    requiresEmail: false,
  },
};
