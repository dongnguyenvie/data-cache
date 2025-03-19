import { useState, useEffect, useCallback } from "react";
import { DataCache } from "../cache/data-cache";
import { DEFAULT_TTL } from "../constants";

interface CacheConfig<T> {
  defaultValue: T | (() => Promise<T>);
  ttl?: number;
  cacheInstance: DataCache;
}

export function useCache<T>(
  key: string,
  { defaultValue, ttl, cacheInstance }: CacheConfig<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetcher = useCallback(
    () =>
      typeof defaultValue === "function"
        ? (defaultValue as () => Promise<T>)()
        : Promise.resolve(defaultValue),
    [defaultValue]
  );

  useEffect(() => {
    const loadCache = async () => {
      try {
        setLoading(true);
        const cachedData = await cacheInstance.getOrSet<T>(
          key,
          fetcher,
          ttl || DEFAULT_TTL
        );
        setData(cachedData);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    loadCache();
  }, []);

  const setCachedData = async (newData: T) => {
    try {
      await cacheInstance.set(key, newData, ttl || DEFAULT_TTL);
      setData(newData);
    } catch (err) {
      setError(err as Error);
    }
  };

  return { data, loading, error, setData: setCachedData };
}
