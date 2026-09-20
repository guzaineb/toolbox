/**
 * Stub CommonJS pour `uuid` (v13 est ESM-only et ne peut pas être requis par Jest).
 * Utilisé uniquement par la configuration Jest (moduleNameMapper dans package.json).
 */
const crypto = require('crypto');

const v4 = () => crypto.randomUUID();
const NIL = '00000000-0000-0000-0000-000000000000';

module.exports = {
  v1: v4,
  v3: v4,
  v4,
  v5: v4,
  v7: v4,
  NIL,
  MAX: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
  parse: (id) =>
    String(id)
      .replace(/-/g, '')
      .match(/.{2}/g)
      .map((h) => parseInt(h, 16)),
  stringify: (bytes) =>
    Array.isArray(bytes) || bytes instanceof Uint8Array
      ? `${hex(bytes.slice(0, 4))}-${hex(bytes.slice(4, 6))}-${hex(bytes.slice(6, 8))}-${hex(
          bytes.slice(8, 10),
        )}-${hex(bytes.slice(10, 16))}`
      : String(bytes),
  validate: (id) =>
    typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
  version: () => 4,
  default: { v4 },
};

function hex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
