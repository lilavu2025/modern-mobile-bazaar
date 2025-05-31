import { useEffect, useRef, useState } from 'react';

interface UseLiveSupabaseQueryOptions<T> {
  queryFn: () => Promise<T>;
  interval?: number; // polling interval in ms
  retryInterval?: number; // retry interval on error
}

export function useLiveSupabaseQuery<T = unknown>({
  queryFn,
  interval = 10000,
  retryInterval = 5000,
}: UseLiveSupabaseQueryOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stoppedRef = useRef(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await queryFn();
      setData(res);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      // retry after retryInterval
      if (!stoppedRef.current) {
        timerRef.current = setTimeout(fetchData, retryInterval);
      }
    }
  };

  useEffect(() => {
    stoppedRef.current = false;
    fetchData();
    timerRef.current = setInterval(fetchData, interval);
    return () => {
      stoppedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, error, loading, refetch: fetchData };
}
