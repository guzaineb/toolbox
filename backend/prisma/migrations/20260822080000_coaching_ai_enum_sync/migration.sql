-- Rattrapage de dérive de schéma (partie 1 : types/enums uniquement).
-- La base contient l'itération antérieure du module (session_summary, ai_project_analyses,
-- ActionEvidenceType…) alors que le schéma Prisma actuel attend les noms définitifs.
-- Les nouvelles valeurs d'enum sont ajoutées ici et utilisées en partie 2
-- (PostgreSQL interdit d'utiliser une valeur ajoutée dans la même transaction).

ALTER TYPE "AiAnalysisType" ADD VALUE IF NOT EXISTS 'JURY_ASSISTANT';

ALTER TYPE "AiAnalysisStatus" ADD VALUE IF NOT EXISTS 'PENDING';

ALTER TYPE "ImprovementPlanStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';

ALTER TYPE "ImprovementObjectiveStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';

DO $$ BEGIN
    CREATE TYPE "EvidenceType" AS ENUM ('LINK', 'TEXT', 'DOCUMENT', 'RESULT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "EvidenceReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'AI_ANALYSIS_READY';

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COACHING_ACTION_SUBMITTED';

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COACHING_EVIDENCE_REVIEWED';

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'RE_EVALUATION_AVAILABLE';
