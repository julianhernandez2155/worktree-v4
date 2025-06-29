import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { useVirtualList } from '@/lib/hooks/usePerformance';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Virtual List Component
 * Efficiently renders large lists by only rendering visible items
 */
export const VirtualList = memo(<T extends any>(props: VirtualListProps<T>) => {
  const {
    items,
    itemHeight,
    height,
    renderItem,
    overscan = 3,
    className,
    onScroll,
    getItemKey = (_, index) => index,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll: virtualScroll,
    startIndex,
  } = useVirtualList(items, {
    itemHeight: typeof itemHeight === 'function' ? 0 : itemHeight,
    containerHeight: height,
    overscan,
    getItemHeight: typeof itemHeight === 'function' ? itemHeight : undefined,
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    virtualScroll(e);
    setIsScrolling(true);
    
    // Clear existing timeout
    clearTimeout(scrollTimeout.current);
    
    // Set scrolling to false after scroll ends
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
    
    onScroll?.(e.currentTarget.scrollTop);
  }, [virtualScroll, onScroll]);

  useEffect(() => {
    return () => {
      clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((item, idx) => {
            const actualIndex = startIndex + idx;
            const key = getItemKey(item, actualIndex);
            
            return (
              <div
                key={key}
                style={{
                  height: typeof itemHeight === 'function' 
                    ? itemHeight(actualIndex) 
                    : itemHeight,
                }}
                className={cn(
                  'virtual-list-item',
                  isScrolling && 'pointer-events-none'
                )}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}) as <T>(props: VirtualListProps<T>) => JSX.Element;

VirtualList.displayName = 'VirtualList';

// Example usage component
interface VirtualListExampleProps<T> {
  items: T[];
  itemHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualListExample<T>({
  items,
  itemHeight = 80,
  renderItem,
  className,
}: VirtualListExampleProps<T>) {
  return (
    <VirtualList
      items={items}
      itemHeight={itemHeight}
      height={600}
      renderItem={renderItem}
      className={className}
      overscan={5}
    />
  );
}