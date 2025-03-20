export interface StoreProvider {
  ttl: number;

  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAll<T>(): Promise<Record<string, T>>;
  clear(): Promise<void>;
}

export interface StoreProviderConfig {
  ttl?: number; // 60s
}

export { MemoryStore } from "./storage/memory-store";
export { LocalStorageStore } from "./storage/local-storage-store";
export { SessionStorageStore } from "./storage/session-storage-store";
export { IndexedDBStore } from "./storage/indexeddb-store";
export { DataCache } from "./cache/data-cache";
export { useCache } from "./hooks/use-cache";
