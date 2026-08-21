export enum NotificationEvent {
  // === COHORT PARTICIPATIONS ===
  APPLICATION_SUBMITTED = 'notification.application.submitted',
  APPLICATION_WITHDRAWN = 'notification.application.withdrawn',
  INVITATION_SENT = 'notification.invitation.sent',
  APPLICATION_ACCEPTED = 'notification.application.accepted',
  APPLICATION_REJECTED = 'notification.application.rejected',
  INVITATION_ACCEPTED = 'notification.invitation.accepted',
  INVITATION_REJECTED = 'notification.invitation.rejected',

  // === INCUBATEUR ===
  MEMBER_JOINED = 'notification.member.joined',
  MEMBER_LEFT = 'notification.member.left',
  MEMBER_INVITED = 'notification.member.invited',
  MEMBER_UPDATED = 'notification.member.updated',
  COHORT_CREATED = 'notification.cohort.created',
  COHORT_UPDATED = 'notification.cohort.updated',
  APPLICATION_OPEN = 'notification.application.open',
  INCUBATOR_STATUS_CHANGED = 'notification.incubator.status.changed',

  // === PORTEUR ===
  PROJECT_CREATED = 'notification.project.created',
  NEW_EVALUATION = 'notification.evaluation.new',
  COACHING_SCHEDULED = 'notification.coaching.scheduled',
  DOCUMENT_GENERATED = 'notification.document.generated',
  DOCUMENT_UPDATED = 'notification.document.updated',
  DOCUMENT_VERIFIED = 'notification.document.verified',
  AI_RESPONSE_READY = 'notification.ai.response.ready',
  STEP_COMPLETED = 'notification.step.completed',

  // === EXPERT ===
  ASSIGNED_AS_COACH = 'notification.expert.assigned.coach',
  ASSIGNED_AS_JURY = 'notification.expert.assigned.jury',
  EVALUATION_REQUESTED = 'notification.expert.evaluation.requested',
  PROJECT_MATCHED = 'notification.expert.project.matched',
  PROJECT_UNMATCHED = 'notification.expert.project.unmatched',

  // === AUTH ===
  PASSWORD_RESET_REQUESTED = 'notification.auth.password.reset.requested',
  PASSWORD_RESET_COMPLETED = 'notification.auth.password.reset.completed',

  // === ADMIN ===
  NEW_USER_REGISTERED = 'notification.admin.user.registered',
  NEW_INCUBATOR = 'notification.admin.incubator.created',
  NEW_EXPERT = 'notification.admin.expert.registered',
  USER_REPORTED = 'notification.admin.user.reported',
  CRITICAL_ERROR = 'notification.admin.critical.error',

  // === DOCUMENTS ===
  DOCUMENT_PENDING = 'notification.document.pending',

  // === COACHING & ÉVALUATION (module) ===
  COACHING_SESSION_SCHEDULED = 'notification.coaching.session.scheduled',
  COACHING_SESSION_UPDATED = 'notification.coaching.session.updated',
  COACHING_SESSION_CANCELLED = 'notification.coaching.session.cancelled',
  COACHING_SESSION_COMPLETED = 'notification.coaching.session.completed',
  COACHING_REPORT_SUBMITTED = 'notification.coaching.report.submitted',
  COACHING_ACTION_ASSIGNED = 'notification.coaching.action.assigned',
  COACHING_ACTION_UPDATED = 'notification.coaching.action.updated',
  COACHING_ACTION_COMPLETED = 'notification.coaching.action.completed',
  COACHING_ACTION_DEADLINE_SOON = 'notification.coaching.action.deadline_soon',
  COACHING_ACTION_OVERDUE = 'notification.coaching.action.overdue',
  COACHING_RECOMMENDATION_ADDED = 'notification.coaching.recommendation.added',
  COACHING_COMMENT_ADDED = 'notification.coaching.comment.added',
  COACH_ASSIGNED = 'notification.coach.assigned',
  COACH_REMOVED = 'notification.coach.removed',
  EVALUATION_AVAILABLE = 'notification.evaluation.available',
  EVALUATION_SUBMITTED = 'notification.evaluation.submitted',
  EVALUATION_ALL_COMPLETED = 'notification.evaluation.all_completed',
  EVALUATION_DEADLINE_SOON = 'notification.evaluation.deadline_soon',
  EVALUATION_TEMPLATE_CREATED = 'notification.evaluation.template.created',
  FINAL_DECISION_MADE = 'notification.final_decision.made',
  FINAL_DECISION_UPDATED = 'notification.final_decision.updated',
  FINAL_DECISION_CONDITIONS_ADDED = 'notification.final_decision.conditions.added',
  CONDITION_VALIDATED = 'notification.condition.validated',
  REEVALUATION_REQUESTED = 'notification.reevaluation.requested',

  // === COACHING & ÉVALUATION — IA (nouveau) ===
  AI_ANALYSIS_READY = 'notification.ai.analysis.ready',
  COACHING_ACTION_SUBMITTED = 'notification.coaching.action.submitted',
  COACHING_EVIDENCE_REVIEWED = 'notification.coaching.evidence.reviewed',
  RE_EVALUATION_AVAILABLE = 'notification.reevaluation.available',
}
