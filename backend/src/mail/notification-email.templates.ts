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
  [NotificationType.COACHING_SCHEDULED]: {
    icon: '📅',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Coaching planifié',
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

  // ─── COACHING & ÉVALUATION (module) ───────────────────
  [NotificationType.COACHING_SESSION_SCHEDULED]: {
    icon: '📅',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Session de coaching planifiée',
  },
  [NotificationType.COACHING_SESSION_UPDATED]: {
    icon: '🔄',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Session de coaching modifiée',
  },
  [NotificationType.COACHING_SESSION_CANCELLED]: {
    icon: '🚫',
    gradientFrom: '#6b7280',
    gradientTo: '#4b5563',
    subjectPrefix: 'Session de coaching annulée',
  },
  [NotificationType.COACHING_SESSION_COMPLETED]: {
    icon: '✅',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Session de coaching terminée',
  },
  [NotificationType.COACHING_REPORT_SUBMITTED]: {
    icon: '📋',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Compte-rendu de coaching',
  },
  [NotificationType.COACHING_ACTION_ASSIGNED]: {
    icon: '📝',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Action de coaching',
  },
  [NotificationType.COACHING_ACTION_UPDATED]: {
    icon: '🔄',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Action de coaching mise à jour',
  },
  [NotificationType.COACHING_ACTION_COMPLETED]: {
    icon: '🎯',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Action de coaching terminée',
  },
  [NotificationType.COACHING_ACTION_DEADLINE_SOON]: {
    icon: '⏰',
    gradientFrom: '#c2410c',
    gradientTo: '#9a3412',
    subjectPrefix: 'Échéance proche',
  },
  [NotificationType.COACHING_ACTION_OVERDUE]: {
    icon: '🚨',
    gradientFrom: '#dc2626',
    gradientTo: '#991b1b',
    subjectPrefix: 'Action en retard',
  },
  [NotificationType.COACHING_RECOMMENDATION_ADDED]: {
    icon: '💡',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Recommandation de coaching',
  },
  [NotificationType.COACHING_COMMENT_ADDED]: {
    icon: '💬',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Commentaire de coaching',
  },
  [NotificationType.COACH_ASSIGNED]: {
    icon: '🏅',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Coach affecté',
  },
  [NotificationType.COACH_REMOVED]: {
    icon: '⚙️',
    gradientFrom: '#6b7280',
    gradientTo: '#4b5563',
    subjectPrefix: 'Coach retiré',
  },
  [NotificationType.EVALUATION_AVAILABLE]: {
    icon: '📊',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Évaluation disponible',
  },
  [NotificationType.EVALUATION_SUBMITTED]: {
    icon: '📤',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Évaluation soumise',
  },
  [NotificationType.EVALUATION_ALL_COMPLETED]: {
    icon: '🏁',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Toutes les évaluations reçues',
  },
  [NotificationType.EVALUATION_DEADLINE_SOON]: {
    icon: '⏰',
    gradientFrom: '#c2410c',
    gradientTo: '#9a3412',
    subjectPrefix: 'Échéance d\'évaluation',
  },
  [NotificationType.EVALUATION_TEMPLATE_CREATED]: {
    icon: '📋',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Grille d\'évaluation créée',
  },
  [NotificationType.FINAL_DECISION_MADE]: {
    icon: '⚖️',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Décision finale',
  },
  [NotificationType.FINAL_DECISION_UPDATED]: {
    icon: '🔄',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Décision finale mise à jour',
  },
  [NotificationType.FINAL_DECISION_CONDITIONS_ADDED]: {
    icon: '📌',
    gradientFrom: '#c2410c',
    gradientTo: '#9a3412',
    subjectPrefix: 'Conditions de la décision',
  },
  [NotificationType.CONDITION_VALIDATED]: {
    icon: '✅',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Condition validée',
  },
  [NotificationType.REEVALUATION_REQUESTED]: {
    icon: '🔁',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Réévaluation demandée',
  },
  [NotificationType.RE_EVALUATION_AVAILABLE]: {
    icon: '🔁',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Nouvelle ré-évaluation disponible',
  },

  // ─── IA ───────────────────────────────────────────────
  [NotificationType.AI_RESPONSE_READY]: {
    icon: '🤖',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Réponse IA prête',
  },
  [NotificationType.AI_ANALYSIS_READY]: {
    icon: '🧠',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Analyse IA disponible',
  },
  [NotificationType.COACHING_ACTION_SUBMITTED]: {
    icon: '📎',
    gradientFrom: '#c9a84c',
    gradientTo: '#b88a2a',
    subjectPrefix: 'Preuve d\'action soumise',
  },
  [NotificationType.COACHING_EVIDENCE_REVIEWED]: {
    icon: '✅',
    gradientFrom: '#2d7a52',
    gradientTo: '#1d5a3a',
    subjectPrefix: 'Preuve d\'action examinée',
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
