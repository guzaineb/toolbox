-- Rattrapage de dérive de schéma (partie 3 : alignement final sur schema.prisma).

-- 1) NotificationType : suppression des variantes obsolètes NEW_COACHING / COACHING_FEEDBACK
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'NotificationType'
          AND e.enumlabel IN ('NEW_COACHING', 'COACHING_FEEDBACK')
    ) THEN
        EXECUTE $sql$
            CREATE TYPE "NotificationType_new" AS ENUM (
                'APPLICATION_SUBMITTED', 'INVITATION_RECEIVED', 'APPLICATION_ACCEPTED',
                'APPLICATION_REJECTED', 'INVITATION_ACCEPTED', 'INVITATION_REJECTED',
                'MEMBER_JOINED', 'MEMBER_LEFT', 'COHORT_CREATED', 'COHORT_UPDATED',
                'APPLICATION_OPEN', 'DOCUMENT_VERIFIED', 'NEW_EVALUATION',
                'DOCUMENT_GENERATED', 'DOCUMENT_UPDATED', 'AI_RESPONSE_READY',
                'STEP_COMPLETED', 'ASSIGNED_AS_COACH', 'ASSIGNED_AS_JURY',
                'EVALUATION_REQUESTED', 'COACHING_SCHEDULED', 'PROJECT_MATCHED',
                'PROJECT_UNMATCHED', 'COACHING_SESSION_SCHEDULED',
                'COACHING_SESSION_UPDATED', 'COACHING_SESSION_CANCELLED',
                'COACHING_SESSION_COMPLETED', 'COACHING_REPORT_SUBMITTED',
                'COACHING_ACTION_ASSIGNED', 'COACHING_ACTION_UPDATED',
                'COACHING_ACTION_COMPLETED', 'COACHING_ACTION_DEADLINE_SOON',
                'COACHING_ACTION_OVERDUE', 'COACHING_RECOMMENDATION_ADDED',
                'COACHING_COMMENT_ADDED', 'COACH_ASSIGNED', 'COACH_REMOVED',
                'EVALUATION_AVAILABLE', 'EVALUATION_SUBMITTED',
                'EVALUATION_ALL_COMPLETED', 'EVALUATION_DEADLINE_SOON',
                'EVALUATION_TEMPLATE_CREATED', 'FINAL_DECISION_MADE',
                'FINAL_DECISION_UPDATED', 'FINAL_DECISION_CONDITIONS_ADDED',
                'CONDITION_VALIDATED', 'REEVALUATION_REQUESTED',
                'AI_ANALYSIS_READY', 'COACHING_ACTION_SUBMITTED',
                'COACHING_EVIDENCE_REVIEWED', 'RE_EVALUATION_AVAILABLE',
                'NEW_USER_REGISTERED', 'NEW_INCUBATOR', 'NEW_EXPERT',
                'USER_REPORTED', 'CRITICAL_ERROR', 'DOCUMENT_PENDING'
            )
        $sql$;

        EXECUTE $sql$
            ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new"
            USING (
                CASE "type"::text
                    WHEN 'NEW_COACHING' THEN 'COACHING_SCHEDULED'
                    WHEN 'COACHING_FEEDBACK' THEN 'COACHING_REPORT_SUBMITTED'
                    ELSE "type"::text
                END
            )::"NotificationType_new"
        $sql$;

        EXECUTE 'ALTER TYPE "NotificationType" RENAME TO "NotificationType_old"';
        EXECUTE 'ALTER TYPE "NotificationType_new" RENAME TO "NotificationType"';
        EXECUTE 'DROP TYPE "NotificationType_old"';
    END IF;
END $$;

-- 2) Table legacy "coachings" remplacée par project_expert_assignments + coaching_sessions
DROP TABLE IF EXISTS "coachings";

-- 3) coaching_actions : liaison vers improvement_objectives
ALTER TABLE "coaching_actions" ADD COLUMN IF NOT EXISTS "objective_id" TEXT;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'coaching_actions_objective_id_fkey'
          AND conrelid = 'public.coaching_actions'::regclass
    ) THEN
        ALTER TABLE "coaching_actions"
            ADD CONSTRAINT "coaching_actions_objective_id_fkey"
            FOREIGN KEY ("objective_id") REFERENCES "improvement_objectives"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "coaching_actions_objective_id_idx" ON "coaching_actions"("objective_id");

-- 4) Index absent du schéma Prisma
DROP INDEX IF EXISTS "coaching_actions_responsible_user_id_idx";

-- 5) rag_documents.updated_at : @updatedAt sans défaut côté schéma
ALTER TABLE "rag_documents" ALTER COLUMN "updated_at" DROP DEFAULT;
