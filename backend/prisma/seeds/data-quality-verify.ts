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

  // Print results
  for (const check of checks) {
    const status = check.result === '0' ? '✅' : '❌';
    console.log(`  ${status} ${check.name}: ${check.result}`);
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
