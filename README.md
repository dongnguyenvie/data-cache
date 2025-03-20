# @nolanx/data-cache 🚀

A lightweight, **pluggable caching system** for frontend & Node.js applications.  
Supports **memory, localStorage, sessionStorage, and IndexedDB** with TTL-based expiration.

## 📥 Installation

```sh
npm install @nolanx/data-cache
```

Or

```sh
yarn add @nolanx/data-cache
```

## 🚀 Quick Start

```ts
import { DataCache, MemoryStore } from "@nolanx/data-cache";

const cache = new DataCache([new MemoryStore()]);

// Store a value for 10 minutes
await cache.set("user", { name: "John" }, 600);

// Get the value
const user = await cache.get("user");
console.log(user); // { name: "John" }
```

## 🛠 Storage Providers

You can choose where data is stored:

- **MemoryStore (default)** – Fastest, resets on refresh
- **LocalStorageStore** – Persistent across page loads
- **SessionStorageStore** – Cleared when the session ends
- **IndexedDBStore** – Best for large data storage

Example:

```ts
import { DataCache, LocalStorageStore } from "@nolanx/data-cache";
const cache = new DataCache([new LocalStorageStore()]);
```

👉 Supports multiple stores (fallback mechanism):

```ts
const cache = new DataCache([
  new IndexedDBStore(),
  new LocalStorageStore(),
  new MemoryStore(),
]);
```

## 🔄 Cache Expiration (TTL)

Set `ttl` (seconds) to expire cache automatically.

Use `ttl = -1` for never-expiring cache.

```ts
await cache.set("user", { name: "Alice" }, -1); // Never expires
```

## ⚡ Get or Fetch (`getOrSet`)

Automatically cache API results:

```ts
const user = await cache.getOrSet(
  "user",
  async () => {
    return fetch("/api/user").then((res) => res.json());
  },
  600
);
```

## 🧹 Invalidate & Clear Cache

```ts
await cache.invalidate("user"); // Remove one key
await cache.clearAll(); // Clear all cache
```

## 🎯 React Hook: `useCache`

✅ Caches API requests in React components

```tsx
import { useCache } from "@nolanx/data-cache";
import { DataCache, MemoryStore } from "@nolanx/data-cache";

const cache = new DataCache([new MemoryStore()]);

function UserProfile() {
  const {
    data: user,
    loading,
    error,
    setData: setUser,
  } = useCache("user", {
    defaultValue: async () => fetch("/api/user").then((res) => res.json()),
    ttl: 600, // Optional TTL in seconds, defaults to 60s
    cacheInstance: cache,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <h1>Welcome, {user.name}!</h1>;
}
```

## 📜 Supported Methods

| Method                        | Description                            |
| ----------------------------- | -------------------------------------- |
| `set(key, value, ttl)`        | Stores a value with a TTL in seconds   |
| `get(key)`                    | Retrieves a value (removes if expired) |
| `getOrSet(key, fetcher, ttl)` | Fetches & caches if missing            |
| `getAll()`                    | Gets all non-expired cache entries     |
| `invalidate(key)`             | Removes a specific key from cache      |
| `clearAll()`                  | Clears all cached data                 |
| `clearExpired()`             | Clears expired cache entries            |

## 📦 Publish & Usage

Once installed, you can import the library like this:

```ts
import { DataCache, MemoryStore, useCache } from "@nolanx/data-cache";
```

👉 Supports both **ES Modules & CommonJS**.

## 🔥 Why `@nolanx/data-cache`?

✅ Pluggable storage (Memory, LocalStorage, IndexedDB)  
✅ TTL-based expiration for automatic cleanup  
✅ Lightweight (~3KB) & fast performance  
✅ Fully typed with TypeScript  
✅ React Hook (`useCache`) support

## 📜 License

MIT © 2025 @nolanx
