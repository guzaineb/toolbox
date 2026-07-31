-- AlterTable
ALTER TABLE "cohort_experts" ADD COLUMN "invited_at" TIMESTAMP(3);
ALTER TABLE "cohort_experts" ADD COLUMN "responded_at" TIMESTAMP(3);

-- AlterColumn
ALTER TABLE "cohort_experts" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"CohortExpertStatus";
