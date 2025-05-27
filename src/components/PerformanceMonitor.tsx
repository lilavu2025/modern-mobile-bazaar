import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  init() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    this.observePaintMetrics();
    this.observeLayoutShift();
    this.observeFirstInputDelay();
    this.observeLargestContentfulPaint();
    this.measureTTFB();
  }

  private observePaintMetrics() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Paint metrics observation failed:', error);
    }
  }

  private observeLayoutShift() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cls = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Layout shift observation failed:', error);
    }
  }

  private observeFirstInputDelay() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.fid = (entry as any).processingStart - entry.startTime;
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('First input delay observation failed:', error);
    }
  }

  private observeLargestContentfulPaint() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Largest contentful paint observation failed:', error);
    }
  }

  private measureTTFB() {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }
    } catch (error) {
      console.warn('TTFB measurement failed:', error);
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  logMetrics() {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Performance Metrics');
      console.log('First Contentful Paint (FCP):', this.metrics.fcp?.toFixed(2), 'ms');
      console.log('Largest Contentful Paint (LCP):', this.metrics.lcp?.toFixed(2), 'ms');
      console.log('First Input Delay (FID):', this.metrics.fid?.toFixed(2), 'ms');
      console.log('Cumulative Layout Shift (CLS):', this.metrics.cls?.toFixed(4));
      console.log('Time to First Byte (TTFB):', this.metrics.ttfb?.toFixed(2), 'ms');
      console.groupEnd();

      // Performance recommendations
      this.logRecommendations();
    }
  }

  private logRecommendations() {
    const recommendations: string[] = [];

    if (this.metrics.fcp && this.metrics.fcp > 1800) {
      recommendations.push('⚠️ FCP is slow. Consider optimizing critical resources.');
    }

    if (this.metrics.lcp && this.metrics.lcp > 2500) {
      recommendations.push('⚠️ LCP is slow. Optimize largest content element loading.');
    }

    if (this.metrics.fid && this.metrics.fid > 100) {
      recommendations.push('⚠️ FID is high. Reduce JavaScript execution time.');
    }

    if (this.metrics.cls && this.metrics.cls > 0.1) {
      recommendations.push('⚠️ CLS is high. Ensure elements have defined dimensions.');
    }

    if (this.metrics.ttfb && this.metrics.ttfb > 600) {
      recommendations.push('⚠️ TTFB is slow. Optimize server response time.');
    }

    if (recommendations.length > 0) {
      console.group('💡 Performance Recommendations');
      recommendations.forEach(rec => console.log(rec));
      console.groupEnd();
    } else {
      console.log('✅ All performance metrics are within good thresholds!');
    }
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React Hook for Performance Monitoring
export const usePerformanceMonitor = () => {
  const monitorRef = useRef<PerformanceMonitor | null>(null);

  useEffect(() => {
    monitorRef.current = PerformanceMonitor.getInstance();
    monitorRef.current.init();

    // Log metrics after page load
    const timer = setTimeout(() => {
      monitorRef.current?.logMetrics();
    }, 3000);

    return () => {
      clearTimeout(timer);
      monitorRef.current?.cleanup();
    };
  }, []);

  return {
    getMetrics: () => monitorRef.current?.getMetrics() || {},
    logMetrics: () => monitorRef.current?.logMetrics()
  };
};

// Component for automatic performance monitoring
const PerformanceMonitorComponent: React.FC = () => {
  usePerformanceMonitor();
  return null;
};

export default PerformanceMonitorComponent;
export { PerformanceMonitorComponent };