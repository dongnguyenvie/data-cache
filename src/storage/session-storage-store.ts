import { DEFAULT_TTL, STORE_KEY } from "../constants";
import { StoreProvider, StoreProviderConfig } from "../index";

export class SessionStorageStore implements StoreProvider {
  private storageKey: string;
  public ttl: number;

  constructor(storageKey = STORE_KEY, options?: StoreProviderConfig) {
    this.storageKey = storageKey;
    this.ttl = options?.ttl ?? DEFAULT_TTL;
  }

  private getStorageData(): Record<string, string> {
    return JSON.parse(sessionStorage.getItem(this.storageKey) || "{}");
  }

  private saveToStorage(storage: Record<string, string>) {
    sessionStorage.setItem(this.storageKey, JSON.stringify(storage));
  }

  async getItem<T>(key: string): Promise<T | null> {
    const store = this.getStorageData();
    return store[key] ? JSON.parse(store[key]) : null;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    const store = this.getStorageData();
    store[key] = JSON.stringify(value);
    this.saveToStorage(store);
  }

  async removeItem(key: string): Promise<void> {
    const store = this.getStorageData();
    delete store[key];
    this.saveToStorage(store);
  }

  async getAll<T>(): Promise<Record<string, T>> {
    const store = this.getStorageData();
    return Object.fromEntries(
      Object.entries(store).map(([key, value]) => [key, JSON.parse(value)])
    );
  }

  async clear(): Promise<void> {
    sessionStorage.removeItem(this.storageKey);
  }
}
