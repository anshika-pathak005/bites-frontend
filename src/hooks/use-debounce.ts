import { useEffect, useState } from "react";

/**
 * useDebounce hook
 * Delays updating the debounced value until after `delay` milliseconds have elapsed
 * since the last time the value changed. Automatically cleans up pending timers on unmount
 * or when value/delay changes.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
