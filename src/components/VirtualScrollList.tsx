import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
  loadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  threshold?: number;
}

function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  getItemKey,
  loadMore,
  hasNextPage = false,
  isLoading = false,
  threshold = 200,
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggered = useRef(false);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleItemCount + overscan * 2
    );

    return { startIndex, endIndex, visibleItemCount };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);

      // Infinite scroll logic
      if (loadMore && hasNextPage && !isLoading) {
        const scrollHeight = e.currentTarget.scrollHeight;
        const clientHeight = e.currentTarget.clientHeight;
        const scrollBottom = scrollHeight - newScrollTop - clientHeight;

        if (scrollBottom <= threshold && !loadMoreTriggered.current) {
          loadMoreTriggered.current = true;
          loadMore();
        }
      }
    },
    [onScroll, loadMore, hasNextPage, isLoading, threshold]
  );

  // Reset load more trigger when loading state changes
  useEffect(() => {
    if (!isLoading) {
      loadMoreTriggered.current = false;
    }
  }, [isLoading]);

  // Scroll to top when items change significantly
  useEffect(() => {
    if (scrollElementRef.current && items.length === 0) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Calculate offset for visible items
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={cn(
        'overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100',
        className
      )}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex;
            
            return (
              <div
                key={key}
                style={{ height: itemHeight }}
                className="flex-shrink-0"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
          
          {/* Loading indicator */}
          {isLoading && (
            <div 
              style={{ height: itemHeight }}
              className="flex items-center justify-center"
            >
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading more...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VirtualScrollList;

// Hook for virtual scrolling with dynamic item heights
export const useVirtualScroll = <T,>({
  items,
  estimatedItemHeight = 50,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  estimatedItemHeight?: number;
  containerHeight: number;
  overscan?: number;
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Measure item heights
  const measureItem = useCallback((index: number, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current[index] = element;
      const height = element.getBoundingClientRect().height;
      
      setItemHeights(prev => {
        const newHeights = [...prev];
        newHeights[index] = height;
        return newHeights;
      });
    }
  }, []);

  // Calculate cumulative heights
  const cumulativeHeights = useMemo(() => {
    const heights = [0];
    for (let i = 0; i < items.length; i++) {
      const height = itemHeights[i] || estimatedItemHeight;
      heights.push(heights[heights.length - 1] + height);
    }
    return heights;
  }, [items.length, itemHeights, estimatedItemHeight]);

  // Find visible range
  const visibleRange = useMemo(() => {
    const findIndex = (offset: number) => {
      let left = 0;
      let right = cumulativeHeights.length - 1;
      
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (cumulativeHeights[mid] < offset) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }
      
      return Math.max(0, left - 1);
    };

    const startIndex = Math.max(0, findIndex(scrollTop) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      findIndex(scrollTop + containerHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, cumulativeHeights, overscan, items.length]);

  const totalHeight = cumulativeHeights[cumulativeHeights.length - 1];
  const offsetY = cumulativeHeights[visibleRange.startIndex];

  return {
    scrollTop,
    setScrollTop,
    visibleRange,
    totalHeight,
    offsetY,
    measureItem,
    cumulativeHeights,
  };
};

// Grid virtual scrolling component
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gap?: number;
  overscan?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  className,
  gap = 0,
  overscan = 5,
  getItemKey,
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowsCount = Math.ceil(items.length / columnsCount);
  const totalHeight = rowsCount * (itemHeight + gap) - gap;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const visibleRowsCount = Math.ceil(containerHeight / (itemHeight + gap));
    const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
    const endRow = Math.min(rowsCount - 1, startRow + visibleRowsCount + overscan * 2);
    
    const startIndex = startRow * columnsCount;
    const endIndex = Math.min(items.length - 1, (endRow + 1) * columnsCount - 1);

    return { startIndex, endIndex, startRow, endRow };
  }, [scrollTop, containerHeight, itemHeight, gap, overscan, rowsCount, columnsCount, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const offsetY = visibleRange.startRow * (itemHeight + gap);

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight, width: containerWidth }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${columnsCount}, ${itemWidth}px)`,
            gap: `${gap}px`,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex;
            
            return (
              <div key={key} style={{ width: itemWidth, height: itemHeight }}>
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}