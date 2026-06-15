const memoryStore = new Map<string, string>();

export interface KVStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const createStorage = (): KVStorage => {
  if (typeof localStorage !== 'undefined') return localStorage;
  return {
    getItem: (key) => memoryStore.get(key) ?? null,
    setItem: (key, value) => memoryStore.set(key, value),
    removeItem: (key) => memoryStore.delete(key),
  };
};

export function loadJSON<T>(storage: KVStorage, key: string, fallback: T): T {
  const value = storage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(storage: KVStorage, key: string, value: T): void {
  storage.setItem(key, JSON.stringify(value));
}
