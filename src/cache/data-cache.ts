import { MemoryStore, StoreProvider } from "../index";

export class DataCache {
  private stores: StoreProvider[];
  private availableStore: StoreProvider | null = null;

  constructor(storeProviders: StoreProvider[] = [new MemoryStore()]) {
    this.stores = storeProviders;
    this.initAvailableStore();
  }

  private async initAvailableStore() {
    const storeChecks = this.stores.map(async (store) => {
      try {
        await store.setItem("_test", "test");
        await store.removeItem("_test");
        return store;
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.allSettled(storeChecks);
    const validStore = results.find(
      (result) => result.status === "fulfilled" && result.value !== null
    );

    this.availableStore =
      validStore && validStore.status === "fulfilled" ? validStore.value : null;
  }

  private async getAvailableStore(): Promise<StoreProvider | null> {
    if (!this.availableStore) {
      await this.initAvailableStore();
    }
    return this.availableStore;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const store = await this.getAvailableStore();
    if (!store) throw new Error("No available storage provider");
    const expiresAt = ttl === -1 ? -1 : Date.now() + ttl * 1000;
    await store.setItem(key, { value, expiresAt });
  }

  async get<T>(key: string): Promise<T | null> {
    const store = await this.getAvailableStore();
    if (!store) return null;
    const item = await store.getItem<{ value: T; expiresAt: number }>(key);
    if (!item) return null;

    if (item.expiresAt !== -1 && item.expiresAt < Date.now()) {
      await store.removeItem(key);
      return null;
    }
    return item.value;
  }

  async getAll<T>(): Promise<Record<string, T>> {
    const store = await this.getAvailableStore();
    if (!store) return {};
    const allItems = await store.getAll<{ value: T; expiresAt: number }>();
    const result: Record<string, T> = {};
    for (const key in allItems) {
      const item = await this.get<T>(key);
      if (item !== null) {
        result[key] = item;
      } else {
        await store.removeItem(key);
      }
    }
    return result;
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const cachedValue = await this.get<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }
    const newValue = await fetcher();
    await this.set(key, newValue, ttl);
    return newValue;
  }

  async invalidate(key: string): Promise<void> {
    const store = await this.getAvailableStore();
    if (!store) return;
    await store.removeItem(key);
  }

  async clearAll(): Promise<void> {
    const store = await this.getAvailableStore();
    if (!store) return;
    await store.clear();
  }
}
