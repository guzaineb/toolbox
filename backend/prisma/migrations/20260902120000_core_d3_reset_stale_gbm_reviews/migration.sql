-- D3 — Règle de review étendue aux étapes GBM one-to-many.
--
-- La révision GBM exige désormais ≥1 élément VALIDE sur chacune des étapes
-- one-to-many (gbm_7a, gbm_7b, gbm_8, gbm_10, gbm_12b). Cette migration DATA
-- réinitialise la révision (is_gbm_reviewed=false, gbm_reviewed_at=null) des
-- projets déjà « révisés » qui ne satisfont pas cette règle, afin que l'état
-- affiché (badge GBM ✓, modules débloqués) reflète la nouvelle exigence.
--
-- Aucun projet n'a de Business Plan finalisé à ce jour : aucun FINAL n'est affecté.

UPDATE "public"."projects"
SET "is_gbm_reviewed" = false, "gbm_reviewed_at" = NULL
WHERE "is_gbm_reviewed" = true
  AND (
    NOT EXISTS (
      SELECT 1 FROM "public"."stakeholders" s
      WHERE s."project_id" = "public"."projects"."id"
        AND btrim(COALESCE(s."name", '')) <> ''
        AND (
          btrim(COALESCE(s."role", '')) <> ''
          OR btrim(COALESCE(s."interest", '')) <> ''
          OR btrim(COALESCE(s."influence", '')) <> ''
          OR btrim(COALESCE(s."engagement_strategy", '')) <> ''
        )
    )
    OR NOT EXISTS (
      SELECT 1 FROM "public"."stakeholder_maps" m
      WHERE m."project_id" = "public"."projects"."id"
        AND btrim(COALESCE(m."stakeholder_name", '')) <> ''
        AND btrim(COALESCE(m."contribution", '')) <> ''
        AND btrim(COALESCE(m."reward", '')) <> ''
    )
    OR NOT EXISTS (
      SELECT 1 FROM "public"."customer_segments" c
      WHERE c."project_id" = "public"."projects"."id"
        AND btrim(COALESCE(c."segment_name", '')) <> ''
        AND (
          btrim(COALESCE(c."pains", '')) <> ''
          OR btrim(COALESCE(c."gains", '')) <> ''
          OR btrim(COALESCE(c."functions", '')) <> ''
        )
    )
    OR NOT EXISTS (
      SELECT 1 FROM "public"."test_discoveries" t
      WHERE t."project_id" = "public"."projects"."id"
        AND btrim(COALESCE(t."hypothesis", '')) <> ''
        AND (
          btrim(COALESCE(t."test_method", '')) <> ''
          OR btrim(COALESCE(t."results", '')) <> ''
          OR btrim(COALESCE(t."learnings", '')) <> ''
        )
    )
    OR NOT EXISTS (
      SELECT 1 FROM "public"."customer_journeys" j
      WHERE j."project_id" = "public"."projects"."id"
        AND btrim(COALESCE(j."stage_name", '')) <> ''
        AND (
          btrim(COALESCE(j."touchpoints", '')) <> ''
          OR btrim(COALESCE(j."customer_emotions", '')) <> ''
          OR btrim(COALESCE(j."improvement_ideas", '')) <> ''
        )
    )
  );