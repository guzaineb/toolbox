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
      title: params.origin === 'invitation' ? 'Invitation acceptée' : 'Candidature acceptée',
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
      title: params.origin === 'invitation' ? 'Invitation refusée' : 'Candidature refusée',
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

  memberJoined(params: { incubatorName: string }): { title: string; message: string } {
    return {
      title: 'Membre ajouté',
      message: `Vous avez été ajouté comme membre de l'incubateur « ${params.incubatorName} ».`,
    };
  }

  memberUpdated(params: { incubatorName: string }): { title: string; message: string } {
    return {
      title: 'Rôle mis à jour',
      message: `Votre rôle dans l'incubateur « ${params.incubatorName} » a été mis à jour.`,
    };
  }

  memberRemoved(params: { incubatorName: string }): { title: string; message: string } {
    return {
      title: 'Membre retiré',
      message: `Vous avez été retiré de l'incubateur « ${params.incubatorName} ».`,
    };
  }

  // ==================== INCUBATOR DOCUMENT ====================

  documentPending(params: {
    documentType?: string;
    incubatorName?: string;
  }): { title: string; message: string } {
    const docLabel = params.documentType ?? 'document';
    const incubator = params.incubatorName
      ? ` dans l'incubateur « ${params.incubatorName} »`
      : '';
    return {
      title: 'Document à vérifier',
      message: `Un nouveau ${docLabel} a été déposé${incubator} et nécessite une vérification.`,
    };
  }

  documentVerified(params: { status: 'approved' | 'rejected' }): { title: string; message: string } {
    const label = params.status === 'approved' ? 'approuvé' : 'rejeté';
    return {
      title: 'Document vérifié',
      message: `Votre document a été ${label}.`,
    };
  }

  // ==================== COHORT ====================

  cohortCreated(params: {
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
    return {
      title: 'Nouvelle cohorte',
      message: `La cohorte « ${params.cohortName} » a été créée dans l'incubateur « ${params.incubatorName} ».`,
    };
  }

  applicationOpen(params: {
    cohortName: string;
    incubatorName: string;
  }): { title: string; message: string } {
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

  incubatorStatusChanged(params: { name: string; status: string }): { title: string; message: string } {
    return {
      title: "Statut de l'incubateur modifié",
      message: `Le statut de l'incubateur « ${params.name} » est passé à « ${params.status} ».`,
    };
  }

  // ==================== EVALUATION / COACHING ====================

  newEvaluation(params: { projectName: string }): { title: string; message: string } {
    return {
      title: 'Nouvelle évaluation',
      message: `Vous avez reçu une nouvelle évaluation pour le projet « ${params.projectName} ».`,
    };
  }

  coachingFeedback(params: { projectName: string }): { title: string; message: string } {
    return {
      title: 'Nouveau feedback de coaching',
      message: `Vous avez reçu un nouveau feedback de coaching pour le projet « ${params.projectName} ».`,
    };
  }

  // ==================== PROJECT ====================

  projectCreated(params: { projectName: string }): { title: string; message: string } {
    return {
      title: 'Projet créé',
      message: `Votre projet « ${params.projectName} » a été créé avec succès.`,
    };
  }

  // ==================== DOCUMENT GENERATION ====================

  documentGenerated(params: { title: string }): { title: string; message: string } {
    return {
      title: 'Document généré',
      message: `Le document « ${params.title} » a été généré avec succès.`,
    };
  }

  documentUpdated(params: { title: string }): { title: string; message: string } {
    return {
      title: 'Document mis à jour',
      message: `Le document « ${params.title} » a été mis à jour.`,
    };
  }

  // ==================== AUTH ====================

  newUserRegistered(params: { email: string }): { title: string; message: string } {
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

  aiResponseReady(params: { label: string }): { title: string; message: string } {
    const lowerLabel = params.label.charAt(0).toLowerCase() + params.label.slice(1);
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
}
