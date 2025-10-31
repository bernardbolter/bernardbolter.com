// types/global.d.ts
export {};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: GtagFunction;
  }

  interface GtagFunction {
    (command: 'js', date: Date): void;
    (command: 'config', id: string, options?: Record<string, unknown>): void;
    (command: 'consent', sub: 'default' | 'update', params: Record<string, 'granted' | 'denied'>): void;
    (command: 'event', name: string, params?: Record<string, unknown>): void;
    (...args: unknown[]): void;
  }
}