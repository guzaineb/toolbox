export function filterAllowedFields<T extends object>(data: T, allowedFields: string[]): Partial<T> {
  const filtered: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    if (allowedFields.includes(key)) filtered[key] = (data as Record<string, unknown>)[key];
  }
  return filtered as Partial<T>;
}
