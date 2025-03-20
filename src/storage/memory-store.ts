import { DEFAULT_TTL } from "../constants";
import { StoreProvider, StoreProviderConfig } from "../index";

export class MemoryStore implements StoreProvider {
  private dataMap: Map<string, string> = new Map();
  public ttl: number;

  constructor(options?: StoreProviderConfig) {
    this.ttl = options?.ttl ?? DEFAULT_TTL;
  }

  async getItem<T>(key: string): Promise<T | null> {
    const item = this.dataMap.get(key);
    return item ? JSON.parse(item) : null;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    this.dataMap.set(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    this.dataMap.delete(key);
  }

  async getAll<T>(): Promise<Record<string, T>> {
    const result: Record<string, T> = {};
    for (const [key, value] of this.dataMap.entries()) {
      result[key] = JSON.parse(value);
    }
    return result;
  }

  async clear(): Promise<void> {
    this.dataMap.clear();
  }
}
