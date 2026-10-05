export interface AiJsonResult<T> {
  data: T | null;
  raw: string;
  attempts: number;
}

/**
 * Extrait et parse le premier objet/tableau JSON d'une réponse LLM.
 * Tolère les blocs markdown ```json ... ``` et le texte parasite autour du JSON.
 */
export function extractJson(raw: string): unknown | null {
  if (!raw) return null;

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates: string[] = [];
  if (fenced?.[1]) candidates.push(fenced[1].trim());
  candidates.push(raw.trim());

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // continue
    }

    const start = findFirst(candidate, ['{', '[']);
    if (start === -1) continue;
    const end = Math.max(
      candidate.lastIndexOf('}'),
      candidate.lastIndexOf(']'),
    );
    if (end <= start) continue;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      // continue
    }
  }
  return null;
}

function findFirst(text: string, chars: string[]): number {
  let best = -1;
  for (const c of chars) {
    const idx = text.indexOf(c);
    if (idx !== -1 && (best === -1 || idx < best)) best = idx;
  }
  return best;
}

/**
 * Valide une sortie IA contre un validateur fourni, avec retry contrôlé.
 * Ne lève jamais d'exception : retourne data=null en cas d'échec (fallback propre).
 */
export async function parseWithRetry<T>(
  runLlm: (repairInstruction?: string) => Promise<string>,
  validate: (value: unknown) => T | null,
  maxAttempts = 2,
): Promise<AiJsonResult<T>> {
  let repair: string | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let raw = '';
    try {
      raw = await runLlm(repair);
    } catch {
      return { data: null, raw, attempts: attempt };
    }
    const parsed = extractJson(raw);
    if (parsed !== null) {
      const validated = validate(parsed);
      if (validated !== null) {
        return { data: validated, raw, attempts: attempt };
      }
    }
    repair =
      "Ta réponse précédente n'était pas un JSON valide ou incomplet. " +
      "Réponds UNIQUEMENT avec l'objet JSON demandé, sans texte avant ni après.";
  }
  return { data: null, raw: '', attempts: maxAttempts };
}

export function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

export function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is string => typeof v === 'string' && v.trim().length > 0,
  );
}

export function clampScore(
  value: unknown,
  min: number,
  max: number,
): number | null {
  const n = asNumber(value);
  if (n === null) return null;
  return Math.max(min, Math.min(max, n));
}
