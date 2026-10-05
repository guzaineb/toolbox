-- Coaching & Évaluation — Modernisation IA (analyses, plan d'amélioration, preuves)

-- 1) Enums
ALTER TYPE "CoachingSessionStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';

CREATE TYPE "AiAnalysisType" AS ENUM ('EVALUATION_ANALYSIS', 'JURY_ASSISTANT', 'RISK_ANALYSIS', 'PROGRESS_ANALYSIS', 'SESSION_BRIEF', 'SESSION_SUMMARY');
CREATE TYPE "AiAnalysisStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE "ImprovementPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "ImprovementObjectiveStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "EvidenceType" AS ENUM ('LINK', 'TEXT', 'DOCUMENT', 'RESULT');
CREATE TYPE "EvidenceReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 2) NotificationType additions (PostgreSQL ne peut ajouter qu'une valeur à la fois dans un ALTER)
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'AI_ANALYSIS_READY';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COACHING_ACTION_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COACHING_EVIDENCE_REVIEWED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'RE_EVALUATION_AVAILABLE';

-- 3) coaching_sessions : contexte & déroulé de session
ALTER TABLE "coaching_sessions" ADD COLUMN "objective" TEXT,
ADD COLUMN "session_type" TEXT,
ADD COLUMN "agenda" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "decisions" TEXT,
ADD COLUMN "summary" TEXT,
ADD COLUMN "next_objectives" TEXT,
ADD COLUMN "started_at" TIMESTAMP(3);

-- 4) coaching_recommendations : provenance (COACH | AI)
ALTER TABLE "coaching_recommendations" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'COACH',
ADD COLUMN "ai_analysis_id" TEXT;
CREATE INDEX "coaching_recommendations_source_idx" ON "coaching_recommendations"("source");

-- 5) ai_analyses : analyses IA structurées persistées
CREATE TABLE "ai_analyses" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "type" "AiAnalysisType" NOT NULL,
    "status" "AiAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "evaluation_id" TEXT,
    "session_id" TEXT,
    "from_evaluation_id" TEXT,
    "to_evaluation_id" TEXT,
    "payload" JSONB,
    "error" TEXT,
    "model" TEXT,
    "prompt_tokens" INTEGER,
    "completion_tokens" INTEGER,
    "total_tokens" INTEGER,
    "duration_ms" INTEGER,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "improvement_plans" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "evaluation_id" TEXT,
    "ai_analysis_id" TEXT,
    "title" TEXT,
    "description" TEXT,
    "status" "ImprovementPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "target_areas" JSONB,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "validated_by" TEXT,
    "validated_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "improvement_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "improvement_objectives" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "CoachingActionPriority" NOT NULL DEFAULT 'MEDIUM',
    "current_score" DOUBLE PRECISION,
    "target_score" DOUBLE PRECISION,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "ImprovementObjectiveStatus" NOT NULL DEFAULT 'PENDING',
    "deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "improvement_objectives_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "action_evidences" (
    "id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "url" TEXT,
    "review_status" "EvidenceReviewStatus" NOT NULL DEFAULT 'PENDING',
    "coach_comment" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "submitted_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_evidences_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_analyses_project_id_idx" ON "ai_analyses"("project_id");
CREATE INDEX "ai_analyses_type_idx" ON "ai_analyses"("type");
CREATE INDEX "ai_analyses_status_idx" ON "ai_analyses"("status");
CREATE INDEX "ai_analyses_evaluation_id_idx" ON "ai_analyses"("evaluation_id");
CREATE INDEX "improvement_plans_project_id_idx" ON "improvement_plans"("project_id");
CREATE INDEX "improvement_plans_status_idx" ON "improvement_plans"("status");
CREATE INDEX "improvement_plans_evaluation_id_idx" ON "improvement_plans"("evaluation_id");
CREATE INDEX "improvement_objectives_plan_id_idx" ON "improvement_objectives"("plan_id");
CREATE INDEX "improvement_objectives_status_idx" ON "improvement_objectives"("status");
CREATE INDEX "action_evidences_action_id_idx" ON "action_evidences"("action_id");
CREATE INDEX "action_evidences_review_status_idx" ON "action_evidences"("review_status");

-- 6) Foreign keys
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "coaching_recommendations" ADD CONSTRAINT "coaching_recommendations_ai_analysis_id_fkey" FOREIGN KEY ("ai_analysis_id") REFERENCES "ai_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "improvement_plans" ADD CONSTRAINT "improvement_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "improvement_plans" ADD CONSTRAINT "improvement_plans_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "improvement_plans" ADD CONSTRAINT "improvement_plans_ai_analysis_id_fkey" FOREIGN KEY ("ai_analysis_id") REFERENCES "ai_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "improvement_plans" ADD CONSTRAINT "improvement_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "improvement_objectives" ADD CONSTRAINT "improvement_objectives_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "improvement_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "action_evidences" ADD CONSTRAINT "action_evidences_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "coaching_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
