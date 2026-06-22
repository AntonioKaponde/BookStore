import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService, TrackingEvent } from '../services/analyticsService';

// Gera um ID de sessão único para esta visita (expira ao fechar a aba)
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const AnalyticsTracker = () => {
  const location = useLocation();
  const clickBuffer = useRef<Omit<TrackingEvent, 'id' | 'timestamp'>[]>([]);
  const lastPath = useRef<string>('');

  // 1. Rastrear Page Views (Visitas)
  useEffect(() => {
    if (location.pathname !== lastPath.current) {
      analyticsService.trackEvent({
        eventType: 'PAGE_VIEW',
        pageUrl: location.pathname,
        sessionId: getSessionId(),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      });
      lastPath.current = location.pathname;
    }
  }, [location]);

  // 2. Rastrear Cliques (Heatmap)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignorar cliques na área de administração
      if (location.pathname.startsWith('/admin')) return;

      const target = e.target as HTMLElement;
      
      const event: Omit<TrackingEvent, 'id' | 'timestamp'> = {
        eventType: 'CLICK',
        pageUrl: location.pathname,
        x: e.pageX,
        y: e.pageY,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        elementId: target.id || undefined,
        elementClass: target.className && typeof target.className === 'string' ? target.className : undefined,
        sessionId: getSessionId()
      };

      clickBuffer.current.push(event);

      // Enviar em lotes de 5 cliques para não sobrecarregar o servidor, ou enviar imediatamente se for um botão importante
      const isImportantClick = target.tagName === 'BUTTON' || target.tagName === 'A';
      
      if (clickBuffer.current.length >= 5 || isImportantClick) {
        analyticsService.trackEventsBatch([...clickBuffer.current]);
        clickBuffer.current = [];
      }
    };

    document.addEventListener('click', handleClick);

    // Enviar cliques restantes ao sair da página
    const flushBuffer = () => {
      if (clickBuffer.current.length > 0) {
        analyticsService.trackEventsBatch([...clickBuffer.current]);
        clickBuffer.current = [];
      }
    };

    window.addEventListener('beforeunload', flushBuffer);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', flushBuffer);
      flushBuffer();
    };
  }, [location.pathname]);

  return null; // O componente é invisível
};
