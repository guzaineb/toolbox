-- AlterEnum
ALTER TYPE "CohortExpertStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "cohort_experts" ADD COLUMN "invited_at" TIMESTAMP(3);
ALTER TABLE "cohort_experts" ADD COLUMN "responded_at" TIMESTAMP(3);