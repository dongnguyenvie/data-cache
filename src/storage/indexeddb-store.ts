import { StoreProvider } from "../index";

export class IndexedDBStore implements StoreProvider {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName = "NolanDataCache", storeName = "cache") {
    this.dbName = dbName;
    this.storeName = storeName;
    this.initDB();
  }

  private async initDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject("IndexedDB not supported.");
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.storeName);
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    await this.initDB();
    if (!this.db) throw new Error("IndexedDB initialization failed.");
    return this.db;
  }

  async getItem<T>(key: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const request = db
        .transaction(this.storeName)
        .objectStore(this.storeName)
        .get(key);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const request = db
        .transaction(this.storeName, "readwrite")
        .objectStore(this.storeName)
        .put(value, key);
      request.onsuccess = () => resolve();
    });
  }

  async removeItem(key: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      db.transaction(this.storeName, "readwrite")
        .objectStore(this.storeName)
        .delete(key);
      resolve();
    });
  }

  async getAll<T>(): Promise<Record<string, T>> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const store = db.transaction(this.storeName).objectStore(this.storeName);
      const items: Record<string, T> = {};
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          items[cursor.key as string] = cursor.value;
          cursor.continue();
        } else {
          resolve(items);
        }
      };
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      db.transaction(this.storeName, "readwrite")
        .objectStore(this.storeName)
        .clear();
      resolve();
    });
  }
}
