-- Remove EVALUATOR from CohortExpertRole enum
-- Step 1: Migrate any existing EVALUATOR rows to JURY (business rule: evaluators become jury members)
UPDATE "cohort_experts" SET "role" = 'JURY' WHERE "role" = 'EVALUATOR';
UPDATE "project_expert_assignments" SET "role" = 'JURY' WHERE "role" = 'EVALUATOR';

-- Step 2: Create new enum type without EVALUATOR
CREATE TYPE "CohortExpertRole_new" AS ENUM ('JURY', 'COACH');

-- Step 3: Migrate columns to new enum type
ALTER TABLE "cohort_experts" ALTER COLUMN "role" TYPE "CohortExpertRole_new" USING "role"::text::"CohortExpertRole_new";
ALTER TABLE "project_expert_assignments" ALTER COLUMN "role" TYPE "CohortExpertRole_new" USING "role"::text::"CohortExpertRole_new";

-- Step 4: Drop old enum type and rename new
ALTER TYPE "CohortExpertRole" RENAME TO "CohortExpertRole_old";
ALTER TYPE "CohortExpertRole_new" RENAME TO "CohortExpertRole";

-- Step 5: Drop old enum type
DROP TYPE "CohortExpertRole_old";
