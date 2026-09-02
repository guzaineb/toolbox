-- D7 — Gating GBM → Business Plan : introduit le statut de finalisation du Business Plan.
-- Additif : ajoute business_plan_status + business_plan_finalized_at sur projects.
CREATE TYPE "BusinessPlanStatus" AS ENUM ('FINAL');

ALTER TABLE "projects" ADD COLUMN "business_plan_status" "BusinessPlanStatus",
ADD COLUMN "business_plan_finalized_at" TIMESTAMP(3);
