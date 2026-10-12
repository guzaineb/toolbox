-- Rattrapage de dérive de schéma (partie 2 : structure).
-- Migration idempotente : sur une base neuve, l'état cible est déjà posé par
-- 20260821120000_coaching_ai_upgrade ; chaque renommage n'est exécuté que si
-- l'ancien état existe réellement (aucune perte de données).

-- 1) coaching_sessions : session_summary → summary + started_at
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'coaching_sessions' AND column_name = 'session_summary'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'coaching_sessions' AND column_name = 'summary'
    ) THEN
        ALTER TABLE "coaching_sessions" RENAME COLUMN "session_summary" TO "summary";
    END IF;
END $$;

ALTER TABLE "coaching_sessions" ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP(3);

-- 2) coaching_recommendations : provenance COACH | AI
ALTER TABLE "coaching_recommendations" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'COACH';

ALTER TABLE "coaching_recommendations" ADD COLUMN IF NOT EXISTS "ai_analysis_id" TEXT;

CREATE INDEX IF NOT EXISTS "coaching_recommendations_source_idx" ON "coaching_recommendations"("source");

-- 3) ai_analyses : transformation de l'ancienne table ai_project_analyses
DO $$
DECLARE
    col record;
BEGIN
    IF to_regclass('public.ai_project_analyses') IS NULL THEN
        RETURN;
    END IF;

    ALTER TABLE "ai_project_analyses" DROP CONSTRAINT IF EXISTS "ai_project_analyses_created_by_fkey";

    FOR col IN
        SELECT * FROM (VALUES
            ('analysis_type', 'type'),
            ('error_message', 'error'),
            ('result_json', 'payload')
        ) AS renames(old_col, new_col)
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'ai_project_analyses' AND column_name = col.old_col
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'ai_project_analyses' AND column_name = col.new_col
        ) THEN
            EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', 'ai_project_analyses', col.old_col, col.new_col);
        END IF;
    END LOOP;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ai_project_analyses' AND column_name = 'payload'
    ) THEN
        ALTER TABLE "ai_project_analyses" ALTER COLUMN "payload" DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ai_project_analyses' AND column_name = 'model'
    ) THEN
        ALTER TABLE "ai_project_analyses" ALTER COLUMN "model" DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ai_project_analyses' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE "ai_project_analyses" ALTER COLUMN "created_by" DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ai_project_analyses' AND column_name = 'status'
    ) THEN
        ALTER TABLE "ai_project_analyses" ALTER COLUMN "status" SET DEFAULT 'PENDING';
    END IF;

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

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ai_project_analyses' AND column_name = 'type'
    ) THEN
        CREATE INDEX IF NOT EXISTS "ai_analyses_type_idx" ON "ai_project_analyses"("type");
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ai_project_analyses' AND column_name = 'status'
    ) THEN
        CREATE INDEX IF NOT EXISTS "ai_analyses_status_idx" ON "ai_project_analyses"("status");
    END IF;

    ALTER TABLE "ai_project_analyses" RENAME TO "ai_analyses";
END $$;

-- 4) improvement_plans : alignement des noms sur le schéma
DO $$
DECLARE
    col record;
BEGIN
    FOR col IN
        SELECT * FROM (VALUES
            ('source_analysis_id', 'ai_analysis_id'),
            ('summary', 'description'),
            ('priority_areas', 'target_areas')
        ) AS renames(old_col, new_col)
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'improvement_plans' AND column_name = col.old_col
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'improvement_plans' AND column_name = col.new_col
        ) THEN
            EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', 'improvement_plans', col.old_col, col.new_col);
        END IF;
    END LOOP;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'improvement_plans'
          AND constraint_name = 'improvement_plans_source_analysis_id_fkey'
    ) THEN
        ALTER TABLE "improvement_plans" RENAME CONSTRAINT "improvement_plans_source_analysis_id_fkey" TO "improvement_plans_ai_analysis_id_fkey";
    END IF;

    ALTER TABLE "improvement_plans" ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0;

    ALTER TABLE "improvement_plans" ADD COLUMN IF NOT EXISTS "deadline" TIMESTAMP(3);

    CREATE INDEX IF NOT EXISTS "improvement_plans_evaluation_id_idx" ON "improvement_plans"("evaluation_id");
END $$;

-- 5) improvement_objectives
CREATE INDEX IF NOT EXISTS "improvement_objectives_status_idx" ON "improvement_objectives"("status");

-- 6) action_evidences : conversion vers EvidenceType / EvidenceReviewStatus
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences' AND column_name = 'evidence_type'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences' AND column_name = 'type'
    ) THEN
        ALTER TABLE "action_evidences" RENAME COLUMN "evidence_type" TO "type";
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences'
          AND column_name = 'type' AND data_type = 'text'
    ) THEN
        ALTER TABLE "action_evidences" ALTER COLUMN "type" TYPE "EvidenceType"
            USING (CASE WHEN "type"::text = 'FILE' THEN 'DOCUMENT' ELSE "type"::text END)::"EvidenceType";
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences' AND column_name = 'file_url'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences' AND column_name = 'url'
    ) THEN
        ALTER TABLE "action_evidences" RENAME COLUMN "file_url" TO "url";
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences' AND column_name = 'review_comment'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences' AND column_name = 'coach_comment'
    ) THEN
        ALTER TABLE "action_evidences" RENAME COLUMN "review_comment" TO "coach_comment";
    END IF;

    ALTER TABLE "action_evidences" ADD COLUMN IF NOT EXISTS "title" TEXT;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences' AND column_name = 'status'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences' AND column_name = 'review_status'
    ) THEN
        ALTER TABLE "action_evidences" RENAME COLUMN "status" TO "review_status";
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences'
          AND column_name = 'review_status' AND data_type = 'text'
    ) THEN
        ALTER TABLE "action_evidences" ALTER COLUMN "review_status" DROP DEFAULT;

        ALTER TABLE "action_evidences" ALTER COLUMN "review_status" TYPE "EvidenceReviewStatus"
            USING (
                CASE "review_status"::text
                    WHEN 'SUBMITTED' THEN 'PENDING'
                    WHEN 'ACCEPTED' THEN 'APPROVED'
                    ELSE 'REJECTED'
                END
            )::"EvidenceReviewStatus";
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'action_evidences' AND column_name = 'review_status'
    ) THEN
        ALTER TABLE "action_evidences" ALTER COLUMN "review_status" SET DEFAULT 'PENDING';
    END IF;

    ALTER TABLE "action_evidences" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

    ALTER INDEX IF EXISTS "action_evidences_status_idx" RENAME TO "action_evidences_review_status_idx";
END $$;

-- 7) Lien recommandation ↔ analyse IA
DO $$ BEGIN
    ALTER TABLE "coaching_recommendations"
        ADD CONSTRAINT "coaching_recommendations_ai_analysis_id_fkey"
        FOREIGN KEY ("ai_analysis_id") REFERENCES "ai_analyses"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
