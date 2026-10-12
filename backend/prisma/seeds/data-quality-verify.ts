import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('=== DATA QUALITY VERIFICATION ===\n');

  const checks: { name: string; result: string }[] = [];

  // 1. Orphan projects
  const orphanProjects = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM projects p LEFT JOIN users u ON p.owner_id=u.id WHERE u.id IS NULL`
  );
  checks.push({ name: 'Orphan projects (no valid owner)', result: `${(orphanProjects[0] as any).c}` });

  // 2. Orphan expert profiles
  const orphanExperts = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM expert_profiles ep LEFT JOIN users u ON ep.user_id=u.id WHERE u.id IS NULL`
  );
  checks.push({ name: 'Orphan expert profiles', result: `${(orphanExperts[0] as any).c}` });

  // 3. Orphan evaluations
  const orphanEvals = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM evaluations e LEFT JOIN projects p ON e.project_id=p.id WHERE p.id IS NULL`
  );
  checks.push({ name: 'Orphan evaluations', result: `${(orphanEvals[0] as any).c}` });

  // 4. Orphan cohort participations
  const orphanCP = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM cohort_participations cp LEFT JOIN projects p ON cp.project_id=p.id LEFT JOIN cohorts c ON cp.cohort_id=c.id WHERE p.id IS NULL OR c.id IS NULL`
  );
  checks.push({ name: 'Orphan cohort participations', result: `${(orphanCP[0] as any).c}` });

  // 5. Invalid user roles
  const invalidRoles = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM users WHERE role NOT IN ('EXPERT','PROJECT_OWNER','INCUBATOR_MEMBER')`
  );
  checks.push({ name: 'Invalid user roles', result: `${(invalidRoles[0] as any).c}` });

  // 6. Invalid availability statuses
  const invalidAvail = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM expert_profiles WHERE availability_status NOT IN ('AVAILABLE','BUSY','UNAVAILABLE')`
  );
  checks.push({ name: 'Invalid availability statuses', result: `${(invalidAvail[0] as any).c}` });

  // 7. Duplicate emails
  const dupEmails = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM (SELECT email FROM users GROUP BY email HAVING count(*)>1) x`
  );
  checks.push({ name: 'Duplicate emails', result: `${(dupEmails[0] as any).c}` });

  // 8. Users without profile
  const noProfile = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM users u LEFT JOIN user_profiles up ON u.profile_id=up.id WHERE up.id IS NULL`
  );
  checks.push({ name: 'Users without profile', result: `${(noProfile[0] as any).c}` });

  // 9. Projects without owner profile
  const projNoOwner = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM projects p LEFT JOIN users u ON p.owner_id=u.id LEFT JOIN user_profiles up ON u.profile_id=up.id WHERE up.id IS NULL`
  );
  checks.push({ name: 'Projects without owner profile', result: `${(projNoOwner[0] as any).c}` });

  // 10. Expert profiles without user
  const expertNoUser = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM expert_profiles ep LEFT JOIN users u ON ep.user_id=u.id WHERE u.id IS NULL`
  );
  checks.push({ name: 'Expert profiles without user', result: `${(expertNoUser[0] as any).c}` });

  // 11. Coaching sessions without assignment
  const csOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM coaching_sessions cs LEFT JOIN project_expert_assignments a ON cs.assignment_id=a.id WHERE a.id IS NULL`
  );
  checks.push({ name: 'Coaching sessions without assignment', result: `${(csOrphan[0] as any).c}` });

  // 12. Invalid coaching session statuses
  const csInvalid = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM coaching_sessions WHERE status NOT IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','RESCHEDULED','MISSED')`
  );
  checks.push({ name: 'Invalid coaching session statuses', result: `${(csInvalid[0] as any).c}` });

  // 13. Coaching actions without project or creator
  const caOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM coaching_actions ca LEFT JOIN projects p ON ca.project_id=p.id LEFT JOIN users u ON ca.created_by=u.id WHERE p.id IS NULL OR u.id IS NULL`
  );
  checks.push({ name: 'Coaching actions orphan (project/creator)', result: `${(caOrphan[0] as any).c}` });

  // 14. Orphan action evidences
  const evOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM action_evidences e LEFT JOIN coaching_actions ca ON e.action_id=ca.id WHERE ca.id IS NULL`
  );
  checks.push({ name: 'Orphan action evidences', result: `${(evOrphan[0] as any).c}` });

  // 15. Coaching comments without author
  const ccOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM coaching_comments c LEFT JOIN users u ON c.author_id=u.id WHERE u.id IS NULL`
  );
  checks.push({ name: 'Coaching comments without author', result: `${(ccOrphan[0] as any).c}` });

  // 16. Evaluation scores outside criterion bounds
  const scoreRange = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM evaluation_scores s JOIN evaluation_criteria c ON s.criterion_id=c.id WHERE s.score < 0 OR s.score > c.max_score`
  );
  checks.push({ name: 'Evaluation scores outside [0, max_score]', result: `${(scoreRange[0] as any).c}` });

  // 17. Published templates whose criteria weights != 100
  const weightSum = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM (SELECT t.id FROM evaluation_templates t JOIN evaluation_criteria c ON c.template_id=t.id WHERE t.published = true GROUP BY t.id HAVING abs(sum(c.weight) - 100) > 0.5) x`
  );
  checks.push({ name: 'Published templates with weight sum != 100', result: `${(weightSum[0] as any).c}` });

  // 18. Published templates without locked_at
  const notLocked = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM evaluation_templates WHERE published = true AND locked_at IS NULL`
  );
  checks.push({ name: 'Published templates without locked_at', result: `${(notLocked[0] as any).c}` });

  // 19. Submitted evaluations without score
  const subNoScore = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM evaluations WHERE status='SUBMITTED' AND score IS NULL`
  );
  checks.push({ name: 'Submitted evaluations without score', result: `${(subNoScore[0] as any).c}` });

  // 20. Submitted evaluations with missing criteria scores
  const subIncomplete = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM evaluations e JOIN evaluation_templates t ON e.template_id=t.id
     WHERE e.status='SUBMITTED'
       AND (SELECT count(*) FROM evaluation_scores s WHERE s.evaluation_id=e.id)
           <> (SELECT count(*) FROM evaluation_criteria cr WHERE cr.template_id=t.id)`
  );
  checks.push({ name: 'Submitted evaluations with missing criterion scores', result: `${(subIncomplete[0] as any).c}` });

  // 21. Orphan evaluation assignments
  const eaOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM evaluation_assignments a
     LEFT JOIN cohorts co ON a.cohort_id=co.id
     LEFT JOIN projects p ON a.project_id=p.id
     LEFT JOIN users u ON a.jury_user_id=u.id
     WHERE co.id IS NULL OR p.id IS NULL OR u.id IS NULL`
  );
  checks.push({ name: 'Orphan evaluation assignments', result: `${(eaOrphan[0] as any).c}` });

  // 22. Orphan jury sessions
  const jsOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM jury_sessions j
     LEFT JOIN projects p ON j.project_id=p.id
     LEFT JOIN cohorts co ON j.cohort_id=co.id
     LEFT JOIN users u ON j.created_by=u.id
     WHERE p.id IS NULL OR co.id IS NULL OR u.id IS NULL`
  );
  checks.push({ name: 'Orphan jury sessions', result: `${(jsOrphan[0] as any).c}` });

  // 23. Invalid jury session statuses
  const jsInvalid = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM jury_sessions WHERE status NOT IN ('DRAFT','OPEN','DELIBERATION','CLOSED')`
  );
  checks.push({ name: 'Invalid jury session statuses', result: `${(jsInvalid[0] as any).c}` });

  // 24. Orphan final decisions
  const fdOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM final_decisions d
     LEFT JOIN projects p ON d.project_id=p.id
     LEFT JOIN cohorts co ON d.cohort_id=co.id
     LEFT JOIN users u ON d.decided_by=u.id
     WHERE p.id IS NULL OR co.id IS NULL OR u.id IS NULL`
  );
  checks.push({ name: 'Orphan final decisions', result: `${(fdOrphan[0] as any).c}` });

  // 25. Orphan decision conditions
  const condOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM final_decision_conditions c LEFT JOIN final_decisions d ON c.decision_id=d.id WHERE d.id IS NULL`
  );
  checks.push({ name: 'Orphan decision conditions', result: `${(condOrphan[0] as any).c}` });

  // 26. Orphan jury session members
  const jmOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM jury_session_members m
     LEFT JOIN jury_sessions j ON m.jury_session_id=j.id
     LEFT JOIN users u ON m.member_user_id=u.id
     WHERE j.id IS NULL OR u.id IS NULL`
  );
  checks.push({ name: 'Orphan jury session members', result: `${(jmOrphan[0] as any).c}` });

  // 27. Generated documents without project or invalid status
  const gdInvalid = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM generated_documents g LEFT JOIN projects p ON g.project_id=p.id
     WHERE p.id IS NULL OR g.status NOT IN ('NOT_GENERATED','GENERATED','UPDATED')`
  );
  checks.push({ name: 'Generated documents orphan/invalid status', result: `${(gdInvalid[0] as any).c}` });

  // 28. Orphan notifications
  const notifOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM notifications n LEFT JOIN users u ON n.user_id=u.id WHERE u.id IS NULL`
  );
  checks.push({ name: 'Orphan notifications', result: `${(notifOrphan[0] as any).c}` });

  // 29. Orphan step progress
  const spOrphan = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM step_progress s LEFT JOIN projects p ON s.project_id=p.id WHERE p.id IS NULL`
  );
  checks.push({ name: 'Orphan step progress', result: `${(spOrphan[0] as any).c}` });

  // 30. Demo accounts that cannot sign in
  const demoBroken = await prisma.$queryRawUnsafe<number>(
    `SELECT count(*)::int as c FROM users WHERE email LIKE '%@projectstruct.demo'
     AND (is_verified = false OR is_active = false OR profile_id IS NULL
          OR role IS NULL OR role NOT IN ('EXPERT','PROJECT_OWNER','INCUBATOR_MEMBER'))`
  );
  checks.push({ name: 'Demo accounts unusable (unverified/inactive/no profile)', result: `${(demoBroken[0] as any).c}` });

  // Print results
  for (const check of checks) {
    const status = check.result === '0' ? '✅' : '❌';
    console.log(`  ${status} ${check.name}: ${check.result}`);
  }

  // Expected minimums (demo scenario must be present)
  const minimums: { name: string; count: number; min: number }[] = [
    { name: 'coaching_sessions', count: await prisma.coachingSession.count(), min: 8 },
    { name: 'coaching_actions', count: await prisma.coachingAction.count(), min: 8 },
    { name: 'action_evidences', count: await prisma.actionEvidence.count(), min: 3 },
    { name: 'coaching_recommendations', count: await prisma.coachingRecommendation.count(), min: 4 },
    { name: 'evaluation_templates', count: await prisma.evaluationTemplate.count(), min: 2 },
    { name: 'evaluation_criteria', count: await prisma.evaluationCriterion.count(), min: 8 },
    { name: 'evaluation_scores', count: await prisma.evaluationScore.count(), min: 20 },
    { name: 'evaluation_assignments', count: await prisma.evaluationAssignment.count(), min: 5 },
    { name: 'evaluations', count: await prisma.evaluation.count(), min: 5 },
    { name: 'jury_sessions', count: await prisma.jurySession.count(), min: 3 },
    { name: 'final_decisions', count: await prisma.finalDecision.count(), min: 3 },
    { name: 'generated_documents', count: await prisma.generatedDocument.count(), min: 5 },
    { name: 'notifications', count: await prisma.notification.count(), min: 10 },
    { name: 'step_progress', count: await prisma.stepProgress.count(), min: 34 },
  ];

  console.log('\n=== DEMO SCENARIO PRESENCE ===');
  for (const m of minimums) {
    const status = m.count >= m.min ? '✅' : '❌';
    console.log(`  ${status} ${m.name}: ${m.count} (expected >= ${m.min})`);
  }

  // Summary counts
  const counts = {
    users: await prisma.user.count(),
    userProfiles: await prisma.userProfile.count(),
    expertProfiles: await prisma.expertProfile.count(),
    expertiseConnections: await prisma.expertProfileExpertiseArea.count(),
    projects: await prisma.project.count(),
    ideaSketches: await prisma.ideaSketch.count(),
    contextSummaries: await prisma.contextSummary.count(),
    problemsNeeds: await prisma.problemsNeeds.count(),
    fundingAssessments: await prisma.fundingAssessment.count(),
    cohorts: await prisma.cohort.count(),
    participations: await prisma.cohortParticipation.count(),
    cohortExperts: await prisma.cohortExpert.count(),
    evaluations: await prisma.evaluation.count(),
    coachingSessions: await prisma.coachingSession.count(),
    recommendations: await prisma.coachingRecommendation.count(),
    assignments: await prisma.projectExpertAssignment.count(),
    coachSessions: await prisma.coachingSession.count(),
    coachActions: await prisma.coachingAction.count(),
    actionEvidences: await prisma.actionEvidence.count(),
    coachComments: await prisma.coachingComment.count(),
    coachRecommendations: await prisma.coachingRecommendation.count(),
    evaluationTemplates: await prisma.evaluationTemplate.count(),
    evaluationCriteria: await prisma.evaluationCriterion.count(),
    evaluationScores: await prisma.evaluationScore.count(),
    evaluationAssignments: await prisma.evaluationAssignment.count(),
    jurySessions: await prisma.jurySession.count(),
    juryMembers: await prisma.jurySessionMember.count(),
    finalDecisions: await prisma.finalDecision.count(),
    decisionConditions: await prisma.finalDecisionCondition.count(),
    generatedDocuments: await prisma.generatedDocument.count(),
    incubators: await prisma.incubator.count(),
    incubatorMembers: await prisma.incubatorMember.count(),
    incubatorDocuments: await prisma.incubatorDocument.count(),
    notifications: await prisma.notification.count(),
    aiAnalyses: await prisma.aiAnalysis.count(),
    improvementPlans: await prisma.improvementPlan.count(),
    conversations: await prisma.conversation.count(),
    messages: await prisma.message.count(),
  };

  console.log('\n=== FINAL COUNTS ===');
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k}: ${v}`);
  }

  // User breakdown
  const roleBreakdown = await prisma.$queryRawUnsafe<{role: string; count: number}[]>(
    `SELECT role, count(*)::int as count FROM users GROUP BY role ORDER BY role`
  );
  console.log('\n=== USER BREAKDOWN ===');
  for (const row of roleBreakdown) {
    console.log(`  ${row.role}: ${row.count}`);
  }

  // Availability breakdown
  const availBreakdown = await prisma.$queryRawUnsafe<{availability_status: string; count: number}[]>(
    `SELECT availability_status, count(*)::int as count FROM expert_profiles GROUP BY availability_status ORDER BY availability_status`
  );
  console.log('\n=== EXPERT AVAILABILITY ===');
  for (const row of availBreakdown) {
    console.log(`  ${row.availability_status}: ${row.count}`);
  }

  // Cohort status breakdown
  const cohortBreakdown = await prisma.$queryRawUnsafe<{status: string; count: number}[]>(
    `SELECT status, count(*)::int as count FROM cohorts GROUP BY status ORDER BY status`
  );
  console.log('\n=== COHORT STATUS ===');
  for (const row of cohortBreakdown) {
    console.log(`  ${row.status}: ${row.count}`);
  }

  // Funding phase breakdown
  const fundingBreakdown = await prisma.$queryRawUnsafe<{phase_maturite: string; count: number}[]>(
    `SELECT phase_maturite, count(*)::int as count FROM funding_assessments GROUP BY phase_maturite ORDER BY phase_maturite`
  );
  console.log('\n=== FUNDING PHASES ===');
  for (const row of fundingBreakdown) {
    console.log(`  ${row.phase_maturite}: ${row.count}`);
  }

  await prisma.$disconnect();
}

verify().catch(e => { console.error(e); process.exit(1); });
