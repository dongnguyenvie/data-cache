import { useState, useEffect, useCallback } from "react";
import { DataCache } from "../cache/data-cache";
import { DEFAULT_TTL } from "../constants";

interface CacheConfig<T> {
  defaultValue: T | (() => Promise<T>);
  ttl?: number;
  cacheProvider: DataCache;
}

export function useCache<T>(
  key: string,
  { defaultValue, ttl, cacheProvider }: CacheConfig<T>
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
        const cachedData = await cacheProvider.getOrSet<T>(key, fetcher, ttl);
        setData(cachedData);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    loadCache();
  }, [key]);

  const setCachedData = async (newData: T) => {
    try {
      await cacheProvider.set(key, newData, ttl);
      setData(newData);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    data,
    loading,
    ready: !loading,
    error,
    setData: setCachedData,
  };
}
