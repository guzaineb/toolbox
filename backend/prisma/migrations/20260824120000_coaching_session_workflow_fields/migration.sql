-- Session de coaching : workflow complet (préparation → déroulement → décisions → actions → clôture)
ALTER TABLE "coaching_sessions" ADD COLUMN "findings" TEXT;
ALTER TABLE "coaching_sessions" ADD COLUMN "topics_discussed" TEXT;
ALTER TABLE "coaching_sessions" ADD COLUMN "blockers" JSONB;
ALTER TABLE "coaching_sessions" ADD COLUMN "objective_result" TEXT;
ALTER TABLE "coaching_sessions" ADD COLUMN "objective_result_reason" TEXT;

CREATE TYPE "SessionObjectiveResult" AS ENUM ('ACHIEVED', 'PARTIALLY_ACHIEVED', 'NOT_ACHIEVED');

ALTER TABLE "coaching_sessions" ALTER COLUMN "objective_result" TYPE "SessionObjectiveResult" USING ("objective_result"::"SessionObjectiveResult");

-- Action : responsable (porteur, coach ou expert) + livrable concerné
ALTER TABLE "coaching_actions" ADD COLUMN "responsible_user_id" TEXT;
ALTER TABLE "coaching_actions" ADD COLUMN "related_document_key" TEXT;

ALTER TABLE "coaching_actions" ADD CONSTRAINT "coaching_actions_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "coaching_actions_responsible_user_id_idx" ON "coaching_actions"("responsible_user_id");
