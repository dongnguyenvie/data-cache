import { useState, useEffect } from "react";
import { DataCache } from "../cache/data-cache";

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number,
  cacheInstance: DataCache
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCache() {
      try {
        setLoading(true);
        const cachedData = await cacheInstance.getOrSet<T>(key, fetcher, ttl);
        if (isMounted) {
          setData(cachedData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    loadCache();

    return () => {
      isMounted = false; // Prevent state updates on unmounted component
    };
  }, [key, fetcher, ttl, cacheInstance]);

  return { data, loading, error };
}
