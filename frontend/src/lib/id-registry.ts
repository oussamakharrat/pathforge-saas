const apiToLegacy = new Map<string, number>();
const legacyToApi = new Map<number, string>();
let nextLegacyId = 1000;

export function toLegacyId(apiId: string): number {
  const existing = apiToLegacy.get(apiId);
  if (existing !== undefined) return existing;
  const legacy = nextLegacyId++;
  apiToLegacy.set(apiId, legacy);
  legacyToApi.set(legacy, apiId);
  return legacy;
}

export function toApiId(legacyId: number): string | undefined {
  return legacyToApi.get(legacyId);
}

export function registerId(apiId: string, legacyId: number): void {
  apiToLegacy.set(apiId, legacyId);
  legacyToApi.set(legacyId, apiId);
  if (legacyId >= nextLegacyId) nextLegacyId = legacyId + 1;
}

export function clearIdRegistry(): void {
  apiToLegacy.clear();
  legacyToApi.clear();
  nextLegacyId = 1000;
}
