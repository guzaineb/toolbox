-- ============================================================
-- PostgreSQL Triggers — The Switchers Toolbox / ProjectStruct
-- Sprint 2 : calculate_project_progress()
-- ============================================================

-- 1. Function : update step_progress status on content upsert
CREATE OR REPLACE FUNCTION update_step_progress_on_upsert()
RETURNS TRIGGER AS $$
DECLARE
  v_step_key TEXT;
BEGIN
  -- Map table_name to step_key for one-to-one tables
  v_step_key := CASE TG_TABLE_NAME
    -- GBM Phase 1 — Ébaucher & Définir
    WHEN 'idea_sketches' THEN 'gbm_1'
    WHEN 'problems_needs' THEN 'gbm_2'
    WHEN 'pestels' THEN 'gbm_3'
    WHEN 'objectives' THEN 'gbm_4'
    WHEN 'mission_visions' THEN 'gbm_5'
    WHEN 'context_summaries' THEN 'gbm_6'

    -- GBM Phase 2 — Construire
    WHEN 'value_propositions' THEN 'gbm_9'
    WHEN 'value_proposition_pivots' THEN 'gbm_11'
    WHEN 'customer_relations_channels' THEN 'gbm_12a'
    WHEN 'key_activities_resources' THEN 'gbm_13'
    WHEN 'eco_designs' THEN 'gbm_14a'
    WHEN 'eco_design_results' THEN 'gbm_14b'
    WHEN 'summary_activities' THEN 'gbm_15'
    WHEN 'cost_structures' THEN 'gbm_16'
    WHEN 'revenue_streams' THEN 'gbm_17'
    WHEN 'cost_revenue_summaries' THEN 'gbm_18'

    -- GBM Phase 3 — Tester
    WHEN 'test_preparations' THEN 'gbm_19'

    -- GBM Phase 4 — Mesurer & Améliorer
    WHEN 'indicators' THEN 'gbm_20'

    -- Business Plan
    WHEN 'management_plans' THEN 'bp_2.1'
    WHEN 'marketing_plans' THEN 'bp_2.2'
    WHEN 'financial_plans' THEN 'bp_2.3'
    WHEN 'legal_plans' THEN 'bp_2.4'
    WHEN 'kpis' THEN 'bp_2.5'
    WHEN 'executive_summaries' THEN 'bp_2.6'

    -- Modules transverses
    WHEN 'funding_assessments' THEN 'funding'
    WHEN 'market_accesses' THEN 'market'
    WHEN 'impact_measures' THEN 'impact'

    ELSE NULL
  END;

  IF v_step_key IS NOT NULL THEN
    INSERT INTO step_progress (id, project_id, step_key, status, completed_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      NEW.project_id,
      v_step_key,
      'COMPLETED',
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (project_id, step_key)
    DO UPDATE SET
      status = 'COMPLETED',
      completed_at = NOW(),
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Function : calculate overall project progress (called on-demand)
CREATE OR REPLACE FUNCTION calculate_project_progress(p_project_id UUID)
RETURNS TABLE (
  total_steps BIGINT,
  completed_steps BIGINT,
  in_progress_steps BIGINT,
  not_started_steps BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH all_steps AS (
    SELECT DISTINCT step_key FROM step_progress WHERE project_id = p_project_id
    UNION
    SELECT unnest(ARRAY[
      -- Phase 1
      'gbm_1','gbm_2','gbm_3','gbm_4','gbm_5','gbm_6',
      -- Phase 2
      'gbm_7a','gbm_7b','gbm_8','gbm_9','gbm_10','gbm_11','gbm_12a','gbm_12b',
      'gbm_13','gbm_14a','gbm_14b','gbm_15','gbm_16','gbm_17','gbm_18',
      -- Phase 3
      'gbm_19',
      -- Phase 4
      'gbm_20',
      -- Business Plan
      'bp_2.1','bp_2.2','bp_2.3','bp_2.4','bp_2.5','bp_2.6',
      -- Modules transverses
      'eco_design','funding','market','impact'
    ])
  ),
  stats AS (
    SELECT
      COUNT(*)::BIGINT AS total_steps,
      COUNT(*) FILTER (WHERE sp.status = 'COMPLETED')::BIGINT AS completed_steps,
      COUNT(*) FILTER (WHERE sp.status = 'IN_PROGRESS')::BIGINT AS in_progress_steps,
      COUNT(*) FILTER (WHERE sp.status IS NULL OR sp.status = 'NOT_STARTED')::BIGINT AS not_started_steps
    FROM all_steps a
    LEFT JOIN step_progress sp ON sp.project_id = p_project_id AND sp.step_key = a.step_key
  )
  SELECT
    s.total_steps,
    s.completed_steps,
    s.in_progress_steps,
    s.not_started_steps,
    CASE WHEN s.total_steps > 0
      THEN ROUND((s.completed_steps::NUMERIC / s.total_steps) * 100, 1)
      ELSE 0
    END AS percentage
  FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- 3. Create triggers for each one-to-one content table
DO $$
DECLARE
  tables TEXT[] := ARRAY[
    -- Phase 1
    'idea_sketches', 'problems_needs', 'pestels', 'objectives', 'mission_visions',
    'context_summaries',
    -- Phase 2
    'value_propositions', 'value_proposition_pivots', 'customer_relations_channels',
    'key_activities_resources', 'eco_designs', 'eco_design_results',
    'summary_activities', 'cost_structures', 'revenue_streams', 'cost_revenue_summaries',
    -- Phase 3
    'test_preparations',
    -- Phase 4
    'indicators',
    -- Business Plan
    'management_plans', 'marketing_plans', 'financial_plans', 'legal_plans',
    'kpis', 'executive_summaries',
    -- Modules transverses
    'funding_assessments', 'market_accesses', 'impact_measures'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_upsert ON %s;', t, t
    );
    EXECUTE format(
      'CREATE TRIGGER trg_%s_upsert
       AFTER INSERT OR UPDATE ON %s
       FOR EACH ROW
       EXECUTE FUNCTION update_step_progress_on_upsert();', t, t
    );
  END LOOP;
END $$;

-- 4. Function : auto-set funding phase maturite from score
CREATE OR REPLACE FUNCTION calculate_funding_phase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.score_maturite IS NOT NULL THEN
    NEW.phase_maturite := CASE
      WHEN NEW.score_maturite <= 3 THEN 'IDEATION'
      WHEN NEW.score_maturite <= 6 THEN 'VALIDATION'
      WHEN NEW.score_maturite <= 9 THEN 'EARLY_STAGE'
      WHEN NEW.score_maturite <= 11 THEN 'GROWTH'
      ELSE 'SCALING'
    END::funding_phase;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_funding_phase ON funding_assessments;
CREATE TRIGGER trg_funding_phase
  BEFORE INSERT OR UPDATE OF score_maturite ON funding_assessments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_funding_phase();
