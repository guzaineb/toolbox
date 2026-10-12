DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'coaching_actions' AND column_name = 'objective_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS "coaching_actions_objective_id_idx" ON "coaching_actions"("objective_id");
    END IF;
END $$;
