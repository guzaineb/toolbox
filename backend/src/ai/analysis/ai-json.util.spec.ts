import { extractJson, parseWithRetry, asString, asNumber, asStringArray, clampScore } from './ai-json.util';

describe('ai-json.util', () => {
  describe('extractJson', () => {
    it('should parse a plain JSON object', () => {
      expect(extractJson('{"a":1}')).toEqual({ a: 1 });
    });

    it('should parse JSON inside a markdown fence', () => {
      expect(extractJson('Voici le résultat :\n```json\n{"a": 2}\n```\nMerci')).toEqual({ a: 2 });
    });

    it('should extract the first JSON object surrounded by prose', () => {
      expect(extractJson('Analyse : {"summary":"ok"} — fin.')).toEqual({ summary: 'ok' });
    });

    it('should return null for empty or non-JSON input', () => {
      expect(extractJson('')).toBeNull();
      expect(extractJson('aucun json ici')).toBeNull();
      expect(extractJson(null as unknown as string)).toBeNull();
    });
  });

  describe('parseWithRetry', () => {
    const validate = (v: unknown) =>
      typeof v === 'object' && v !== null && 'ok' in v ? (v as { ok: boolean }) : null;

    it('should return validated data on the first attempt', async () => {
      const runLlm = jest.fn().mockResolvedValue('```json\n{"ok":true}\n```');
      const result = await parseWithRetry(runLlm, validate);
      expect(result.data).toEqual({ ok: true });
      expect(result.attempts).toBe(1);
      expect(runLlm).toHaveBeenCalledTimes(1);
    });

    it('should retry once with a repair instruction when the first answer is invalid', async () => {
      const runLlm = jest
        .fn()
        .mockResolvedValueOnce("pas du json du tout")
        .mockResolvedValueOnce('{"ok":false}');
      const result = await parseWithRetry(runLlm, validate);
      expect(result.data).toEqual({ ok: false });
      expect(result.attempts).toBe(2);
      expect(runLlm).toHaveBeenLastCalledWith(expect.stringContaining('JSON valide'));
    });

    it('should never throw and stop immediately when the LLM call fails', async () => {
      const runLlm = jest.fn().mockRejectedValue(new Error('LLM down'));
      const result = await parseWithRetry<{ ok: boolean }>(runLlm, validate);
      expect(result.data).toBeNull();
      // Une erreur réseau/LLM n'est pas retentée : sortie immédiate avec data null
      expect(result.attempts).toBe(1);
    });

    it('should stop early when the LLM throws on the second attempt', async () => {
      const runLlm = jest.fn().mockResolvedValueOnce('nope').mockRejectedValue(new Error('boom'));
      const result = await parseWithRetry<{ ok: boolean }>(runLlm, validate);
      expect(result.data).toBeNull();
      expect(result.attempts).toBe(2);
    });
  });

  describe('asString / asNumber', () => {
    it('should trim strings and reject empty ones', () => {
      expect(asString('  bonjour  ')).toBe('bonjour');
      expect(asString('   ')).toBeNull();
      expect(asString(42 as unknown)).toBeNull();
    });

    it('should accept finite numbers only', () => {
      expect(asNumber(3.5)).toBe(3.5);
      expect(asNumber(Number.NaN)).toBeNull();
      expect(asNumber('3' as unknown)).toBeNull();
    });
  });

  describe('asStringArray', () => {
    it('should keep non-empty strings as-is and drop the rest', () => {
      // NB : les chaînes sont conservées sans re-trim (comportement de l'utilitaire)
      expect(asStringArray(['a', '', ' b ', 5, null])).toEqual(['a', ' b ']);
      expect(asStringArray('not an array')).toEqual([]);
    });
  });

  describe('clampScore', () => {
    it('should clamp values into [min,max]', () => {
      expect(clampScore(-5, 0, 100)).toBe(0);
      expect(clampScore(150, 0, 100)).toBe(100);
      expect(clampScore(50, 0, 100)).toBe(50);
      expect(clampScore('50', 0, 100)).toBeNull();
    });
  });
});
