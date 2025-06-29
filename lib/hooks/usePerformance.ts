import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

/**
 * Debounce hook - delays invoking a function until after wait milliseconds
 */
export function useDebounce<T>(value: T, delay: number): T {
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

/**
 * Throttle hook - ensures a function is called at most once in a specified time period
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeout = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeElapsed = now - lastRun.current;

    if (timeElapsed >= delay) {
      callback(...args);
      lastRun.current = now;
    } else {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - timeElapsed);
    }
  }, [callback, delay]) as T;
}

/**
 * Intersection Observer hook - detect when an element is visible in viewport
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Previous value hook - store the previous value of a prop or state
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Mount status hook - check if component is mounted
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  return mounted;
}

/**
 * Lazy load hook - for code splitting and lazy loading components
 */
export function useLazyLoad<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): T | undefined {
  const [component, setComponent] = useState<T | undefined>(fallback);

  useEffect(() => {
    importFn().then(module => {
      setComponent(() => module.default);
    });
  }, [importFn]);

  return component;
}

/**
 * Virtual list hook - for rendering large lists efficiently
 */
interface VirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  getItemHeight?: (index: number) => number;
}

export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
) {
  const { itemHeight, containerHeight, overscan = 3, getItemHeight } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = useMemo(() => {
    if (getItemHeight) {
      return items.reduce((sum, _, index) => sum + getItemHeight(index), 0);
    }
    return items.length * itemHeight;
  }, [items.length, itemHeight, getItemHeight]);

  const offsetY = useMemo(() => {
    if (getItemHeight) {
      let offset = 0;
      for (let i = 0; i < visibleRange.startIndex; i++) {
        offset += getItemHeight(i);
      }
      return offset;
    }
    return visibleRange.startIndex * itemHeight;
  }, [visibleRange.startIndex, itemHeight, getItemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
  };
}

/**
 * Stable callback hook - maintains callback reference while allowing dependencies to change
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });
  
  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}