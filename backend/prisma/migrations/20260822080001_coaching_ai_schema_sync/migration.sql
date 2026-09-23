-- Rattrapage de dérive de schéma (partie 2 : structure).
-- Alignement de la base sur le schéma Prisma actuel par RENOMMAGES
-- (aucune perte de données ; les anciennes colonnes/tables sont conservées et renommées).

-- 1) coaching_sessions : session_summary → summary + started_at
ALTER TABLE "coaching_sessions" RENAME COLUMN "session_summary" TO "summary";

ALTER TABLE "coaching_sessions" ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP(3);

-- 2) coaching_recommendations : provenance COACH | AI
ALTER TABLE "coaching_recommendations" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'COACH';

ALTER TABLE "coaching_recommendations" ADD COLUMN IF NOT EXISTS "ai_analysis_id" TEXT;

CREATE INDEX IF NOT EXISTS "coaching_recommendations_source_idx" ON "coaching_recommendations"("source");

-- 3) ai_analyses : transformation de l'ancienne table ai_project_analyses
ALTER TABLE "ai_project_analyses" DROP CONSTRAINT IF EXISTS "ai_project_analyses_created_by_fkey";

ALTER TABLE "ai_project_analyses" RENAME COLUMN "analysis_type" TO "type";

ALTER TABLE "ai_project_analyses" RENAME COLUMN "error_message" TO "error";

ALTER TABLE "ai_project_analyses" RENAME COLUMN "result_json" TO "payload";

ALTER TABLE "ai_project_analyses" ALTER COLUMN "payload" DROP NOT NULL;

ALTER TABLE "ai_project_analyses" ALTER COLUMN "model" DROP NOT NULL;

ALTER TABLE "ai_project_analyses" ALTER COLUMN "created_by" DROP NOT NULL;

ALTER TABLE "ai_project_analyses" ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "ai_project_analyses" DROP COLUMN IF EXISTS "summary";

ALTER TABLE "ai_project_analyses" ADD COLUMN IF NOT EXISTS "total_tokens" INTEGER;

ALTER TABLE "ai_project_analyses" ADD COLUMN IF NOT EXISTS "duration_ms" INTEGER;

ALTER TABLE "ai_project_analyses" ADD COLUMN IF NOT EXISTS "from_evaluation_id" TEXT;

ALTER TABLE "ai_project_analyses" ADD COLUMN IF NOT EXISTS "to_evaluation_id" TEXT;

ALTER TABLE "ai_project_analyses" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DROP INDEX IF EXISTS "ai_project_analyses_project_id_analysis_type_idx";

ALTER INDEX IF EXISTS "ai_project_analyses_pkey" RENAME TO "ai_analyses_pkey";

ALTER INDEX IF EXISTS "ai_project_analyses_project_id_idx" RENAME TO "ai_analyses_project_id_idx";

ALTER INDEX IF EXISTS "ai_project_analyses_evaluation_id_idx" RENAME TO "ai_analyses_evaluation_id_idx";

ALTER INDEX IF EXISTS "ai_project_analyses_session_id_idx" RENAME TO "ai_analyses_session_id_idx";

ALTER TABLE "ai_project_analyses" RENAME CONSTRAINT "ai_project_analyses_project_id_fkey" TO "ai_analyses_project_id_fkey";

ALTER TABLE "ai_project_analyses" RENAME CONSTRAINT "ai_project_analyses_evaluation_id_fkey" TO "ai_analyses_evaluation_id_fkey";

ALTER TABLE "ai_project_analyses" RENAME CONSTRAINT "ai_project_analyses_session_id_fkey" TO "ai_analyses_session_id_fkey";

CREATE INDEX IF NOT EXISTS "ai_analyses_type_idx" ON "ai_project_analyses"("type");

CREATE INDEX IF NOT EXISTS "ai_analyses_status_idx" ON "ai_project_analyses"("status");

ALTER TABLE "ai_project_analyses" RENAME TO "ai_analyses";

-- 4) improvement_plans : alignement des noms sur le schéma
ALTER TABLE "improvement_plans" RENAME COLUMN "source_analysis_id" TO "ai_analysis_id";

ALTER TABLE "improvement_plans" RENAME CONSTRAINT "improvement_plans_source_analysis_id_fkey" TO "improvement_plans_ai_analysis_id_fkey";

ALTER TABLE "improvement_plans" RENAME COLUMN "summary" TO "description";

ALTER TABLE "improvement_plans" RENAME COLUMN "priority_areas" TO "target_areas";

ALTER TABLE "improvement_plans" ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "improvement_plans" ADD COLUMN IF NOT EXISTS "deadline" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "improvement_plans_evaluation_id_idx" ON "improvement_plans"("evaluation_id");

-- 5) improvement_objectives
CREATE INDEX IF NOT EXISTS "improvement_objectives_status_idx" ON "improvement_objectives"("status");

-- 6) action_evidences : conversion vers EvidenceType / EvidenceReviewStatus
ALTER TABLE "action_evidences" RENAME COLUMN "evidence_type" TO "type";

ALTER TABLE "action_evidences" ALTER COLUMN "type" TYPE "EvidenceType"
    USING (CASE WHEN "type"::text = 'FILE' THEN 'DOCUMENT' ELSE "type"::text END)::"EvidenceType";

ALTER TABLE "action_evidences" RENAME COLUMN "file_url" TO "url";

ALTER TABLE "action_evidences" RENAME COLUMN "review_comment" TO "coach_comment";

ALTER TABLE "action_evidences" ADD COLUMN IF NOT EXISTS "title" TEXT;

ALTER TABLE "action_evidences" RENAME COLUMN "status" TO "review_status";

ALTER TABLE "action_evidences" ALTER COLUMN "review_status" DROP DEFAULT;

ALTER TABLE "action_evidences" ALTER COLUMN "review_status" TYPE "EvidenceReviewStatus"
    USING (
        CASE "review_status"::text
            WHEN 'SUBMITTED' THEN 'PENDING'
            WHEN 'ACCEPTED' THEN 'APPROVED'
            ELSE 'REJECTED'
        END
    )::"EvidenceReviewStatus";

ALTER TABLE "action_evidences" ALTER COLUMN "review_status" SET DEFAULT 'PENDING';

ALTER TABLE "action_evidences" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER INDEX IF EXISTS "action_evidences_status_idx" RENAME TO "action_evidences_review_status_idx";

-- 7) Lien recommandation ↔ analyse IA
DO $$ BEGIN
    ALTER TABLE "coaching_recommendations"
        ADD CONSTRAINT "coaching_recommendations_ai_analysis_id_fkey"
        FOREIGN KEY ("ai_analysis_id") REFERENCES "ai_analyses"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
