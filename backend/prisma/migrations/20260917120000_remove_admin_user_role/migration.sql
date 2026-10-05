-- Remove ADMIN from the UserRole enum (platform-wide role deleted)
-- The incubator membership role "MemberRole.ADMIN" is intentionally preserved.

-- Step 1: Neutralize any user still holding the removed ADMIN role.
--         Account is deactivated and the role cleared so the record is kept
--         without granting platform-wide access.
UPDATE "users" SET "is_active" = false, "role" = NULL WHERE "role" = 'ADMIN';

-- Step 2: Create new enum type without ADMIN
CREATE TYPE "UserRole_new" AS ENUM ('EXPERT', 'PROJECT_OWNER', 'INCUBATOR_MEMBER');

-- Step 3: Migrate the column to the new enum type
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING "role"::text::"UserRole_new";

-- Step 4: Drop old enum type and rename new
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
