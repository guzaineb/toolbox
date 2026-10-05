import { resolveModuleRoute } from './resolve-module-route'

/**
 * Liaison des livrables du volet coaching vers le parcours GBM du porteur.
 *
 * Une action de coaching peut référencer un livrable du projet via sa clé
 * `related_document_key` (clé des DOCUMENT_DEFINITIONS côté backend). Lorsque
 * cette clé correspond à une donnée produite par une étape GBM, le détail de
 * session propose une redirection « Voir dans le GBM » vers l'étape concernée.
 *
 * Ce mapping est déclaratif et orienté navigation uniquement : aucune écriture
 * GBM n'est jamais déclenchée depuis le volet coaching.
 */
export const GBM_STEP_BY_DOCUMENT_KEY: Record<string, string> = {
  idea_sketch: 'gbm_1', // Étape 1 — Esquissez votre idée d'entreprise
  problems_needs: 'gbm_2', // Étape 2 — Identifier les problèmes et les besoins
  pestel: 'gbm_3', // Étape 3 — Comprendre le contexte (PESTEL)
  mission_vision: 'gbm_5', // Étape 5 — Mission, vision et valeurs
  stakeholders: 'gbm_7a', // Étape 7a — Parties prenantes
  customer_segments: 'gbm_8', // Étape 8 — Segments de clientèle
  value_proposition: 'gbm_9', // Étape 9 — Proposition de valeur
  test_reports: 'gbm_10', // Étape 10 — Test de la proposition
  customer_journey: 'gbm_12b', // Étape 12b — Parcours du client
  eco_design_report: 'gbm_14a', // Étape 14a — Éco-conception
  swot: 'gbm_21', // Étape 21 — Analyse SWOT
}

export interface GbmActionContext {
  /** Étape GBM concernée par le livrable de l'action. */
  stepKey: string
  /** Route existante du module GBM (« ?step= »). */
  path: string
}

/**
 * Résout le contexte GBM d'une action de coaching à partir de son livrable,
 * en utilisant la navigation existante du module GBM (aucune écriture).
 */
export function gbmActionContext(
  projectId: string,
  relatedDocumentKey?: string | null,
): GbmActionContext | null {
  if (!relatedDocumentKey) return null
  const stepKey = GBM_STEP_BY_DOCUMENT_KEY[relatedDocumentKey]
  if (!stepKey) return null
  const path = resolveModuleRoute(projectId, 'GBM', stepKey)
  if (!path) return null
  return { stepKey, path }
}