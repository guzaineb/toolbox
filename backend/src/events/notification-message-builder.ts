import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationMessageBuilder {
  // ==================== COHORT PARTICIPATIONS (existing) ====================

  invitationSent(params: {
    projectName: string;
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    return {
      title: 'Invitation à une cohorte',
      message: `Votre projet « ${params.projectName} » a été invité à rejoindre la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} ».`,
    };
  }

  applicationSubmitted(params: {
    projectName: string;
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    return {
      title: 'Nouvelle candidature',
      message: `Le projet « ${params.projectName} » a soumis une candidature à la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} ».`,
    };
  }

  participationAccepted(params: {
    origin: 'invitation' | 'application';
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    const verb = params.origin === 'invitation' ? 'invitation' : 'candidature';
    return {
      title:
        params.origin === 'invitation'
          ? 'Invitation acceptée'
          : 'Candidature acceptée',
      message: `Votre ${verb} à la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} » a été acceptée.`,
    };
  }

  participationRejected(params: {
    origin: 'invitation' | 'application';
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    const verb = params.origin === 'invitation' ? 'invitation' : 'candidature';
    return {
      title:
        params.origin === 'invitation'
          ? 'Invitation refusée'
          : 'Candidature refusée',
      message: `Votre ${verb} à la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} » a été refusée.`,
    };
  }

  invitationDeclined(params: {
    projectName: string;
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    return {
      title: 'Invitation déclinée',
      message: `Le projet « ${params.projectName} » a décliné l'invitation à la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} ».`,
    };
  }

  // ==================== EXPERT INVITATION / APPLICATION ====================

  expertInvitationSent(params: {
    role: 'JURY' | 'COACH';
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    const roleLabel = params.role === 'JURY' ? 'Jury' : 'Coach';
    return {
      title: `Invitation comme ${roleLabel}`,
      message: `Vous avez été invité à rejoindre la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} » en tant que ${roleLabel}.`,
    };
  }

  expertApplicationSubmitted(params: {
    role: 'JURY' | 'COACH';
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    const roleLabel = params.role === 'JURY' ? 'Jury' : 'Coach';
    return {
      title: `Candidature comme ${roleLabel}`,
      message: `Un expert a déposé une candidature comme ${roleLabel} pour la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} ».`,
    };
  }

  invitationAcceptedByRecipient(params: {
    entityType: 'expert' | 'project';
    projectName?: string;
    role?: 'JURY' | 'COACH';
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    if (params.entityType === 'expert') {
      const roleLabel = params.role === 'JURY' ? 'Jury' : 'Coach';
      return {
        title: 'Invitation acceptée',
        message: `L'expert a accepté l'invitation comme ${roleLabel} pour la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} ».`,
      };
    }
    return {
      title: 'Invitation acceptée',
      message: `Le projet « ${params.projectName} » a accepté l'invitation à rejoindre la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} ».`,
    };
  }

  invitationRejectedByRecipient(params: {
    entityType: 'expert' | 'project';
    projectName?: string;
    role?: 'JURY' | 'COACH';
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    if (params.entityType === 'expert') {
      const roleLabel = params.role === 'JURY' ? 'Jury' : 'Coach';
      return {
        title: 'Invitation refusée',
        message: `L'expert a refusé l'invitation comme ${roleLabel} pour la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} ».`,
      };
    }
    return {
      title: 'Invitation refusée',
      message: `Le projet « ${params.projectName} » a refusé l'invitation à rejoindre la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} ».`,
    };
  }

  expertApplicationAccepted(params: {
    role: 'JURY' | 'COACH';
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    const roleLabel = params.role === 'JURY' ? 'Jury' : 'Coach';
    return {
      title: `Candidature acceptée`,
      message: `Votre candidature comme ${roleLabel} pour la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} » a été acceptée.`,
    };
  }

  expertApplicationRejected(params: {
    role: 'JURY' | 'COACH';
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    const roleLabel = params.role === 'JURY' ? 'Jury' : 'Coach';
    return {
      title: `Candidature refusée`,
      message: `Votre candidature comme ${roleLabel} pour la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} » a été refusée.`,
    };
  }

  // ==================== EXPERT ASSIGNMENT ====================

  expertAssignment(params: {
    role: 'JURY' | 'COACH';
    cohortName: string;
    incubatorName: string;
    projectName?: string;
  }): { title: string; message: string } {
    const roleLabel = params.role === 'JURY' ? 'Jury' : 'Coach';
    const title = `Nouvelle affectation comme ${roleLabel}`;
    const base = `Vous avez été désigné comme ${roleLabel} pour la cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} »`;
    const message = params.projectName
      ? `${base} et le projet « ${params.projectName} ».`
      : `${base}.`;
    return { title, message };
  }

  // ==================== INCUBATOR MEMBER ====================

  memberJoined(params: { incubatorName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Membre ajouté',
      message: `Vous avez été ajouté comme membre de l'incubateur « ${params.incubatorName} ».`,
    };
  }

  memberUpdated(params: { incubatorName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Rôle mis à jour',
      message: `Votre rôle dans l'incubateur « ${params.incubatorName} » a été mis à jour.`,
    };
  }

  memberRemoved(params: { incubatorName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Membre retiré',
      message: `Vous avez été retiré de l'incubateur « ${params.incubatorName} ».`,
    };
  }

  // ==================== INCUBATOR DOCUMENT ====================

  documentPending(params: { documentType?: string; incubatorName?: string }): {
    title: string;
    message: string;
  } {
    const docLabel = params.documentType ?? 'document';
    const incubator = params.incubatorName
      ? ` dans l'incubateur « ${params.incubatorName} »`
      : '';
    return {
      title: 'Document à vérifier',
      message: `Un nouveau ${docLabel} a été déposé${incubator} et nécessite une vérification.`,
    };
  }

  documentVerified(params: { status: 'APPROVED' | 'REJECTED' }): {
    title: string;
    message: string;
  } {
    const label = params.status === 'APPROVED' ? 'approuvé' : 'rejeté';
    return {
      title: 'Document vérifié',
      message: `Votre document a été ${label}.`,
    };
  }

  // ==================== COHORT ====================

  cohortCreated(params: { cohortName: string; incubatorName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Nouvelle cohorte',
      message: `La cohorte « ${params.cohortName} » a été créée dans l'incubateur « ${params.incubatorName} ».`,
    };
  }

  applicationOpen(params: { cohortName: string; incubatorName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Cohorte ouverte aux candidatures',
      message: `La cohorte « ${params.cohortName} » de l'incubateur « ${params.incubatorName} » est maintenant ouverte aux candidatures.`,
    };
  }

  // ==================== INCUBATOR ====================

  newIncubator(params: { name: string }): { title: string; message: string } {
    return {
      title: 'Nouvel incubateur',
      message: `Un nouvel incubateur « ${params.name} » a été créé.`,
    };
  }

  incubatorStatusChanged(params: { name: string; status: string }): {
    title: string;
    message: string;
  } {
    return {
      title: "Statut de l'incubateur modifié",
      message: `Le statut de l'incubateur « ${params.name} » est passé à « ${params.status} ».`,
    };
  }

  // ==================== EVALUATION / COACHING ====================

  newEvaluation(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Nouvelle évaluation',
      message: `Vous avez reçu une nouvelle évaluation pour le projet « ${params.projectName} ».`,
    };
  }

  // ==================== PROJECT ====================

  projectCreated(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Projet créé',
      message: `Votre projet « ${params.projectName} » a été créé avec succès.`,
    };
  }

  // ==================== DOCUMENT GENERATION ====================

  documentGenerated(params: { title: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Document généré',
      message: `Le document « ${params.title} » a été généré avec succès.`,
    };
  }

  documentUpdated(params: { title: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Document mis à jour',
      message: `Le document « ${params.title} » a été mis à jour.`,
    };
  }

  // ==================== AUTH ====================

  newUserRegistered(params: { email: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Inscription réussie',
      message: `Bienvenue sur ToolBox, ${params.email} ! Votre compte a été créé avec succès.`,
    };
  }

  // ==================== EXPERT PROFILE ====================

  newExpertProfile(): { title: string; message: string } {
    return {
      title: 'Profil expert créé',
      message: 'Votre profil expert a été créé avec succès.',
    };
  }

  // ==================== AI ====================

  aiResponseReady(params: { label: string }): {
    title: string;
    message: string;
  } {
    const lowerLabel =
      params.label.charAt(0).toLowerCase() + params.label.slice(1);
    return {
      title: `${params.label} généré`,
      message: `Votre ${lowerLabel} est prêt.`,
    };
  }

  // ==================== STEP ====================

  stepCompleted(): { title: string; message: string } {
    return {
      title: 'GBM validé',
      message: 'Félicitations ! Votre Green Business Model a été validé.',
    };
  }

  // ==================== COACHING & ÉVALUATION (module) ====================

  coachingSessionScheduled(params: {
    projectName: string;
    sessionTitle?: string;
    scheduledAt: Date;
  }): { title: string; message: string } {
    return {
      title: 'Session de coaching planifiée',
      message: `Une session de coaching pour le projet « ${params.projectName} »${params.sessionTitle ? ` (« ${params.sessionTitle} »)` : ''} est planifiée le ${params.scheduledAt.toLocaleString('fr-FR')}.`,
    };
  }

  coachingSessionUpdated(params: { projectName: string; scheduledAt: Date }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Session de coaching modifiée',
      message: `La session de coaching du projet « ${params.projectName} » a été reprogrammée au ${params.scheduledAt.toLocaleString('fr-FR')}.`,
    };
  }

  coachingSessionCancelled(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Session de coaching annulée',
      message: `La session de coaching du projet « ${params.projectName} » a été annulée.`,
    };
  }

  coachingSessionCompleted(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Session de coaching terminée',
      message: `La session de coaching du projet « ${params.projectName} » a été clôturée. Le compte-rendu est disponible.`,
    };
  }

  coachingReportSubmitted(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Compte-rendu de coaching',
      message: `Le compte-rendu de coaching du projet « ${params.projectName} » a été soumis.`,
    };
  }

  coachingActionAssigned(params: {
    projectName: string;
    actionTitle: string;
  }): { title: string; message: string } {
    return {
      title: 'Nouvelle action de coaching',
      message: `Une action « ${params.actionTitle} » a été ajoutée pour le projet « ${params.projectName} ».`,
    };
  }

  coachingActionUpdated(params: { projectName: string; actionTitle: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Action de coaching mise à jour',
      message: `L'action « ${params.actionTitle} » du projet « ${params.projectName} » a été mise à jour.`,
    };
  }

  coachingActionCompleted(params: { actionTitle: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Action de coaching terminée',
      message: `L'action « ${params.actionTitle} » a été marquée comme terminée.`,
    };
  }

  coachingActionDeadlineSoon(params: { actionTitle: string; deadline: Date }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Échéance proche',
      message: `L'action « ${params.actionTitle} » arrive à échéance le ${params.deadline.toLocaleDateString('fr-FR')}.`,
    };
  }

  coachingActionOverdue(params: { actionTitle: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Action en retard',
      message: `L'action « ${params.actionTitle} » est en retard.`,
    };
  }

  coachingRecommendationAdded(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Recommandation de coaching',
      message: `Une nouvelle recommandation a été ajoutée pour le projet « ${params.projectName} ».`,
    };
  }

  coachingCommentAdded(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Commentaire de coaching',
      message: `Un commentaire a été ajouté sur le coaching du projet « ${params.projectName} ».`,
    };
  }

  coachingActionSubmitted(params: {
    projectName: string;
    actionTitle: string;
  }): { title: string; message: string } {
    return {
      title: 'Preuve d’action soumise',
      message: `Le porteur a soumis une preuve pour l'action « ${params.actionTitle} » du projet « ${params.projectName} ». Votre validation est attendue.`,
    };
  }

  coachingEvidenceReviewed(params: {
    projectName: string;
    actionTitle: string;
    approved: boolean;
  }): { title: string; message: string } {
    return {
      title: params.approved ? 'Preuve validée' : 'Preuve à compléter',
      message: params.approved
        ? `Votre preuve pour l'action « ${params.actionTitle} » (projet « ${params.projectName} ») a été validée par le coach.`
        : `La preuve soumise pour l'action « ${params.actionTitle} » (projet « ${params.projectName} ») n'a pas été retenue. Consultez le commentaire du coach.`,
    };
  }

  aiAnalysisReady(params: { projectName: string; analysisType?: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Analyse IA disponible',
      message: `Une nouvelle analyse IA est disponible pour le projet « ${params.projectName} »${params.analysisType ? ` (${params.analysisType})` : ''}.`,
    };
  }

  reEvaluationAvailable(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Ré-évaluation disponible',
      message: `Une grille de ré-évaluation est prête pour le projet « ${params.projectName} ». Vous pouvez renseigner la nouvelle évaluation.`,
    };
  }

  coachAssigned(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Coach affecté',
      message: `Vous avez été affecté comme coach du projet « ${params.projectName} ».`,
    };
  }

  coachRemoved(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Coach retiré',
      message: `Vous n'êtes plus coach du projet « ${params.projectName} ».`,
    };
  }

  evaluationAvailable(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Évaluation disponible',
      message: `Une évaluation est disponible pour le projet « ${params.projectName} ».`,
    };
  }

  evaluationSubmitted(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Évaluation soumise',
      message: `Une évaluation a été soumise pour le projet « ${params.projectName} ».`,
    };
  }

  evaluationAllCompleted(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Toutes les évaluations reçues',
      message: `Toutes les évaluations ont été soumises pour le projet « ${params.projectName} ».`,
    };
  }

  evaluationDeadlineSoon(params: { projectName: string; deadline: Date }): {
    title: string;
    message: string;
  } {
    return {
      title: "Échéance d'évaluation",
      message: `L'évaluation du projet « ${params.projectName} » doit être rendue avant le ${params.deadline.toLocaleDateString('fr-FR')}.`,
    };
  }

  evaluationTemplateCreated(params: {
    templateName: string;
    cohortName: string;
  }): { title: string; message: string } {
    return {
      title: "Grille d'évaluation créée",
      message: `La grille « ${params.templateName} » a été créée pour la cohorte « ${params.cohortName} ».`,
    };
  }

  finalDecisionMade(params: { projectName: string; decision: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Décision finale',
      message: `Une décision finale (« ${params.decision} ») a été rendue pour le projet « ${params.projectName} ».`,
    };
  }

  finalDecisionUpdated(params: { projectName: string; decision: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Décision finale mise à jour',
      message: `La décision finale du projet « ${params.projectName} » est désormais « ${params.decision} ».`,
    };
  }

  finalDecisionConditionsAdded(params: {
    projectName: string;
    count: number;
  }): { title: string; message: string } {
    return {
      title: 'Conditions de la décision',
      message: `${params.count} condition(s) ont été ajoutées à la décision du projet « ${params.projectName} ».`,
    };
  }

  conditionValidated(params: { conditionDescription: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Condition validée',
      message: `La condition « ${params.conditionDescription} » a été validée.`,
    };
  }

  reevaluationRequested(params: { projectName: string }): {
    title: string;
    message: string;
  } {
    return {
      title: 'Réévaluation demandée',
      message: `Une réévaluation a été demandée pour le projet « ${params.projectName} ».`,
    };
  }
}
