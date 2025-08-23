"use client";
import { useEffect } from 'react';

export default function DevLogger() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (typeof window === 'undefined') return;
    if ((window as any).__DEV_LOGGER_INSTALLED__) return;
    
    (window as any).__DEV_LOGGER_INSTALLED__ = true;

    const originalConsole = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console)
    };

    (['log', 'info', 'warn', 'error', 'debug'] as const).forEach(level => {
      (console as any)[level] = (...args: any[]) => {
        // Mostrar en consola del navegador
        originalConsole[level](...args);
        
        // Enviar a terminal (sin bloquear si falla)
        fetch('/api/dev-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level,
            args: args.map(arg => {
              if (typeof arg === 'object' && arg !== null) {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return '[Object]';
                }
              }
              return String(arg);
            }),
            timestamp: new Date().toISOString(),
            url: window.location.href
          })
        }).catch(() => {}); // Silencioso si falla
      };
    });

    // También capturar errores no manejados
    window.addEventListener('error', (e) => {
      fetch('/api/dev-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          args: [`Uncaught Error: ${e.message}`, `at ${e.filename}:${e.lineno}:${e.colno}`],
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      }).catch(() => {});
    });

    console.info('🔍 Dev logger activo - logs aparecerán en tu terminal');
  }, []);

  return null;
}