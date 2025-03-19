import { useState, useEffect } from "react";
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

  useEffect(() => {
    let isMounted = true;

    const loadCache = async () => {
      const fetcher =
        typeof defaultValue === "function"
          ? defaultValue
          : () => Promise.resolve(defaultValue);

      try {
        setLoading(true);
        const cachedData = await cacheInstance.getOrSet<T>(
          key,
          fetcher as () => Promise<T>,
          ttl || DEFAULT_TTL
        );
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
    };

    loadCache();

    return () => {
      isMounted = false; // Prevent updates after component unmount
    };
  }, [key, ttl, cacheInstance]);

  return { data, loading, error };
}
