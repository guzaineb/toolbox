-- CreateEnum
CREATE TYPE "CoachingSessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'MISSED');

-- CreateEnum
CREATE TYPE "CoachingActionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'REJECTED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CoachingActionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "CoachingRecommendationStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "EvaluationStage" AS ENUM ('INTERMEDIATE', 'FINAL');

-- CreateEnum
CREATE TYPE "FinalDecisionType" AS ENUM ('ACCEPTED', 'REJECTED', 'CONDITIONAL', 'EXTENDED', 'REEVALUATION_REQUIRED');

-- CreateEnum
CREATE TYPE "ConditionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "JurySessionStatus" AS ENUM ('DRAFT', 'OPEN', 'DELIBERATION', 'CLOSED');

-- AlterEnum
ALTER TYPE "CohortExpertRole" ADD VALUE 'EVALUATOR';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'COACHING_SESSION_SCHEDULED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_SESSION_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_SESSION_CANCELLED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_SESSION_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_REPORT_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_ACTION_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_ACTION_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_ACTION_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_ACTION_DEADLINE_SOON';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_ACTION_OVERDUE';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_RECOMMENDATION_ADDED';
ALTER TYPE "NotificationType" ADD VALUE 'COACHING_COMMENT_ADDED';
ALTER TYPE "NotificationType" ADD VALUE 'COACH_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'COACH_REMOVED';
ALTER TYPE "NotificationType" ADD VALUE 'EVALUATION_AVAILABLE';
ALTER TYPE "NotificationType" ADD VALUE 'EVALUATION_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'EVALUATION_ALL_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'EVALUATION_DEADLINE_SOON';
ALTER TYPE "NotificationType" ADD VALUE 'EVALUATION_TEMPLATE_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'FINAL_DECISION_MADE';
ALTER TYPE "NotificationType" ADD VALUE 'FINAL_DECISION_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'FINAL_DECISION_CONDITIONS_ADDED';
ALTER TYPE "NotificationType" ADD VALUE 'CONDITION_VALIDATED';
ALTER TYPE "NotificationType" ADD VALUE 'REEVALUATION_REQUESTED';

-- DropIndex
DROP INDEX "evaluations_project_id_jury_user_id_key";

-- AlterTable
ALTER TABLE "evaluations" ADD COLUMN     "recommendation" TEXT,
ADD COLUMN     "status" "EvaluationStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "submitted_at" TIMESTAMP(3),
ADD COLUMN     "template_id" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "score" DROP NOT NULL;

-- CreateTable
CREATE TABLE "project_expert_assignments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "expert_user_id" TEXT NOT NULL,
    "role" "CohortExpertRole" NOT NULL DEFAULT 'COACH',
    "status" "CohortExpertStatus" NOT NULL DEFAULT 'ACTIVE',
    "assigned_by" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMP(3),

    CONSTRAINT "project_expert_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_sessions" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "title" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER,
    "status" "CoachingSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "report" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "coaching_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_recommendations" (
    "id" TEXT NOT NULL,
    "session_id" TEXT,
    "project_id" TEXT,
    "author_id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "priority" "CoachingActionPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "CoachingRecommendationStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaching_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_actions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "session_id" TEXT,
    "assignment_id" TEXT,
    "recommendation_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CoachingActionStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "CoachingActionPriority" NOT NULL DEFAULT 'MEDIUM',
    "deadline" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deadline_reminded_at" TIMESTAMP(3),
    "overdue_reminded_at" TIMESTAMP(3),

    CONSTRAINT "coaching_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_comments" (
    "id" TEXT NOT NULL,
    "action_id" TEXT,
    "session_id" TEXT,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "resource_type" "ResourceType",
    "resource_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coaching_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_templates" (
    "id" TEXT NOT NULL,
    "cohort_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stage" "EvaluationStage" NOT NULL DEFAULT 'FINAL',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "locked_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_criteria" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "max_score" INTEGER NOT NULL DEFAULT 5,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "evaluation_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_scores" (
    "id" TEXT NOT NULL,
    "evaluation_id" TEXT NOT NULL,
    "criterion_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,

    CONSTRAINT "evaluation_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_assignments" (
    "id" TEXT NOT NULL,
    "cohort_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "jury_user_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3),
    "deadline_reminded_at" TIMESTAMP(3),

    CONSTRAINT "evaluation_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_decisions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "cohort_id" TEXT NOT NULL,
    "decision" "FinalDecisionType" NOT NULL,
    "final_score" DOUBLE PRECISION,
    "justification" TEXT,
    "new_end_date" TIMESTAMP(3),
    "decided_by" TEXT NOT NULL,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "final_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_decision_conditions" (
    "id" TEXT NOT NULL,
    "decision_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" "ConditionStatus" NOT NULL DEFAULT 'PENDING',
    "validated_by" TEXT,
    "validated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "final_decision_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jury_sessions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "cohort_id" TEXT NOT NULL,
    "title" TEXT,
    "status" "JurySessionStatus" NOT NULL DEFAULT 'DRAFT',
    "observations" TEXT,
    "reevaluation_requested" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "jury_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jury_session_members" (
    "id" TEXT NOT NULL,
    "jury_session_id" TEXT NOT NULL,
    "member_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jury_session_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_expert_assignments_project_id_idx" ON "project_expert_assignments"("project_id");

-- CreateIndex
CREATE INDEX "project_expert_assignments_expert_user_id_idx" ON "project_expert_assignments"("expert_user_id");

-- CreateIndex
CREATE INDEX "project_expert_assignments_status_idx" ON "project_expert_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_expert_assignments_project_id_expert_user_id_role_key" ON "project_expert_assignments"("project_id", "expert_user_id", "role");

-- CreateIndex
CREATE INDEX "coaching_sessions_assignment_id_idx" ON "coaching_sessions"("assignment_id");

-- CreateIndex
CREATE INDEX "coaching_sessions_status_idx" ON "coaching_sessions"("status");

-- CreateIndex
CREATE INDEX "coaching_recommendations_session_id_idx" ON "coaching_recommendations"("session_id");

-- CreateIndex
CREATE INDEX "coaching_recommendations_project_id_idx" ON "coaching_recommendations"("project_id");

-- CreateIndex
CREATE INDEX "coaching_actions_project_id_idx" ON "coaching_actions"("project_id");

-- CreateIndex
CREATE INDEX "coaching_actions_session_id_idx" ON "coaching_actions"("session_id");

-- CreateIndex
CREATE INDEX "coaching_actions_assignment_id_idx" ON "coaching_actions"("assignment_id");

-- CreateIndex
CREATE INDEX "coaching_actions_status_idx" ON "coaching_actions"("status");

-- CreateIndex
CREATE INDEX "coaching_actions_deadline_idx" ON "coaching_actions"("deadline");

-- CreateIndex
CREATE INDEX "coaching_comments_action_id_idx" ON "coaching_comments"("action_id");

-- CreateIndex
CREATE INDEX "coaching_comments_session_id_idx" ON "coaching_comments"("session_id");

-- CreateIndex
CREATE INDEX "coaching_comments_resource_type_resource_id_idx" ON "coaching_comments"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "evaluation_templates_cohort_id_idx" ON "evaluation_templates"("cohort_id");

-- CreateIndex
CREATE INDEX "evaluation_criteria_template_id_idx" ON "evaluation_criteria"("template_id");

-- CreateIndex
CREATE INDEX "evaluation_scores_evaluation_id_idx" ON "evaluation_scores"("evaluation_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_scores_evaluation_id_criterion_id_key" ON "evaluation_scores"("evaluation_id", "criterion_id");

-- CreateIndex
CREATE INDEX "evaluation_assignments_cohort_id_idx" ON "evaluation_assignments"("cohort_id");

-- CreateIndex
CREATE INDEX "evaluation_assignments_project_id_idx" ON "evaluation_assignments"("project_id");

-- CreateIndex
CREATE INDEX "evaluation_assignments_jury_user_id_idx" ON "evaluation_assignments"("jury_user_id");

-- CreateIndex
CREATE INDEX "evaluation_assignments_deadline_idx" ON "evaluation_assignments"("deadline");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_assignments_cohort_id_project_id_jury_user_id_key" ON "evaluation_assignments"("cohort_id", "project_id", "jury_user_id");

-- CreateIndex
CREATE INDEX "final_decisions_project_id_idx" ON "final_decisions"("project_id");

-- CreateIndex
CREATE INDEX "final_decisions_cohort_id_idx" ON "final_decisions"("cohort_id");

-- CreateIndex
CREATE INDEX "final_decision_conditions_decision_id_idx" ON "final_decision_conditions"("decision_id");

-- CreateIndex
CREATE INDEX "jury_sessions_project_id_idx" ON "jury_sessions"("project_id");

-- CreateIndex
CREATE INDEX "jury_sessions_cohort_id_idx" ON "jury_sessions"("cohort_id");

-- CreateIndex
CREATE INDEX "jury_sessions_status_idx" ON "jury_sessions"("status");

-- CreateIndex
CREATE INDEX "jury_session_members_member_user_id_idx" ON "jury_session_members"("member_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "jury_session_members_jury_session_id_member_user_id_key" ON "jury_session_members"("jury_session_id", "member_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "evaluations_status_idx" ON "evaluations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_project_id_jury_user_id_template_id_version_key" ON "evaluations"("project_id", "jury_user_id", "template_id", "version");

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "evaluation_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_expert_assignments" ADD CONSTRAINT "project_expert_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_expert_assignments" ADD CONSTRAINT "project_expert_assignments_expert_user_id_fkey" FOREIGN KEY ("expert_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_expert_assignments" ADD CONSTRAINT "project_expert_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "project_expert_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_recommendations" ADD CONSTRAINT "coaching_recommendations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "coaching_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_recommendations" ADD CONSTRAINT "coaching_recommendations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_recommendations" ADD CONSTRAINT "coaching_recommendations_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_actions" ADD CONSTRAINT "coaching_actions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_actions" ADD CONSTRAINT "coaching_actions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "coaching_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_actions" ADD CONSTRAINT "coaching_actions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "project_expert_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_actions" ADD CONSTRAINT "coaching_actions_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "coaching_recommendations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_actions" ADD CONSTRAINT "coaching_actions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_comments" ADD CONSTRAINT "coaching_comments_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "coaching_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_comments" ADD CONSTRAINT "coaching_comments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "coaching_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_comments" ADD CONSTRAINT "coaching_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_templates" ADD CONSTRAINT "evaluation_templates_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_templates" ADD CONSTRAINT "evaluation_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_criteria" ADD CONSTRAINT "evaluation_criteria_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "evaluation_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_scores" ADD CONSTRAINT "evaluation_scores_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_scores" ADD CONSTRAINT "evaluation_scores_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "evaluation_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assignments" ADD CONSTRAINT "evaluation_assignments_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assignments" ADD CONSTRAINT "evaluation_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assignments" ADD CONSTRAINT "evaluation_assignments_jury_user_id_fkey" FOREIGN KEY ("jury_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assignments" ADD CONSTRAINT "evaluation_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_decisions" ADD CONSTRAINT "final_decisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_decisions" ADD CONSTRAINT "final_decisions_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_decisions" ADD CONSTRAINT "final_decisions_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_decision_conditions" ADD CONSTRAINT "final_decision_conditions_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "final_decisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_decision_conditions" ADD CONSTRAINT "final_decision_conditions_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_sessions" ADD CONSTRAINT "jury_sessions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_sessions" ADD CONSTRAINT "jury_sessions_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_sessions" ADD CONSTRAINT "jury_sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_session_members" ADD CONSTRAINT "jury_session_members_jury_session_id_fkey" FOREIGN KEY ("jury_session_id") REFERENCES "jury_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_session_members" ADD CONSTRAINT "jury_session_members_member_user_id_fkey" FOREIGN KEY ("member_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
