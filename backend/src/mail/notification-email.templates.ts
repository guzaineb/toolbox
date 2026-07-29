import { NotificationType } from '@prisma/client';

export interface NotificationTemplateConfig {
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  subjectPrefix: string;
}

export const NOTIFICATION_EMAIL_TEMPLATES: Record<NotificationType, NotificationTemplateConfig> = {
  // ─── INVITATIONS ──────────────────────────────────────
  [NotificationType.INVITATION_RECEIVED]: {
    icon: '📩',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Invitation',
  },
  [NotificationType.APPLICATION_ACCEPTED]: {
    icon: '🎉',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Candidature acceptée',
  },
  [NotificationType.APPLICATION_REJECTED]: {
    icon: '💡',
    gradientFrom: '#c2410c',
    gradientTo: '#9a3412',
    subjectPrefix: 'Candidature',
  },
  [NotificationType.INVITATION_ACCEPTED]: {
    icon: '🤝',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Invitation acceptée',
  },
  [NotificationType.INVITATION_REJECTED]: {
    icon: '💬',
    gradientFrom: '#6b7280',
    gradientTo: '#4b5563',
    subjectPrefix: 'Invitation',
  },

  // ─── INCUBATEUR / COHORTE ─────────────────────────────
  [NotificationType.MEMBER_JOINED]: {
    icon: '👋',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Nouveau membre',
  },
  [NotificationType.MEMBER_LEFT]: {
    icon: '👋',
    gradientFrom: '#6b7280',
    gradientTo: '#4b5563',
    subjectPrefix: 'Départ membre',
  },
  [NotificationType.COHORT_CREATED]: {
    icon: '📋',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Nouvelle cohorte',
  },
  [NotificationType.COHORT_UPDATED]: {
    icon: '📝',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Cohorte mise à jour',
  },
  [NotificationType.APPLICATION_OPEN]: {
    icon: '📢',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Candidatures ouvertes',
  },
  [NotificationType.APPLICATION_SUBMITTED]: {
    icon: '📄',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Candidature reçue',
  },

  // ─── DOCUMENTS ────────────────────────────────────────
  [NotificationType.DOCUMENT_VERIFIED]: {
    icon: '✅',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Document vérifié',
  },
  [NotificationType.DOCUMENT_PENDING]: {
    icon: '⏳',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Document en attente',
  },
  [NotificationType.DOCUMENT_GENERATED]: {
    icon: '📄',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Document généré',
  },
  [NotificationType.DOCUMENT_UPDATED]: {
    icon: '📄',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Document mis à jour',
  },

  // ─── COACHING / ÉVALUATION ────────────────────────────
  [NotificationType.NEW_EVALUATION]: {
    icon: '📊',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Nouvelle évaluation',
  },
  [NotificationType.NEW_COACHING]: {
    icon: '🎯',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Nouveau coaching',
  },
  [NotificationType.COACHING_SCHEDULED]: {
    icon: '📅',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Coaching planifié',
  },
  [NotificationType.COACHING_FEEDBACK]: {
    icon: '💬',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Feedback coaching',
  },
  [NotificationType.EVALUATION_REQUESTED]: {
    icon: '📋',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Évaluation demandée',
  },
  [NotificationType.STEP_COMPLETED]: {
    icon: '⭐',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Étape complétée',
  },

  // ─── EXPERT ───────────────────────────────────────────
  [NotificationType.ASSIGNED_AS_COACH]: {
    icon: '🏅',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Coach attitré',
  },
  [NotificationType.ASSIGNED_AS_JURY]: {
    icon: '⚖️',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Membre du jury',
  },
  [NotificationType.PROJECT_MATCHED]: {
    icon: '🔗',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Projet associé',
  },
  [NotificationType.PROJECT_UNMATCHED]: {
    icon: '🔗',
    gradientFrom: '#6b7280',
    gradientTo: '#4b5563',
    subjectPrefix: 'Projet désassocié',
  },

  // ─── IA ───────────────────────────────────────────────
  [NotificationType.AI_RESPONSE_READY]: {
    icon: '🤖',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Réponse IA prête',
  },

  // ─── ADMIN ────────────────────────────────────────────
  [NotificationType.NEW_USER_REGISTERED]: {
    icon: '👤',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Nouvel utilisateur',
  },
  [NotificationType.NEW_INCUBATOR]: {
    icon: '🏢',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Nouvel incubateur',
  },
  [NotificationType.NEW_EXPERT]: {
    icon: '👤',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Nouvel expert',
  },
  [NotificationType.USER_REPORTED]: {
    icon: '⚠️',
    gradientFrom: '#c2410c',
    gradientTo: '#9a3412',
    subjectPrefix: 'Signalement',
  },
  [NotificationType.CRITICAL_ERROR]: {
    icon: '🚨',
    gradientFrom: '#dc2626',
    gradientTo: '#991b1b',
    subjectPrefix: 'Erreur critique',
  },
};
