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
  COACHING_FEEDBACK = 'notification.coaching.feedback',
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
}
