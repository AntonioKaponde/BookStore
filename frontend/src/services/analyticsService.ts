import api from './api';

export type TrackingEventType = 'PAGE_VIEW' | 'CLICK' | 'ADD_TO_CART' | 'CHECKOUT_START' | 'CHECKOUT_COMPLETE';

export interface TrackingEvent {
  id?: string;
  eventType: TrackingEventType;
  pageUrl: string;
  x?: number;
  y?: number;
  screenWidth?: number;
  screenHeight?: number;
  elementId?: string;
  elementClass?: string;
  sessionId?: string;
  additionalData?: string;
  timestamp?: string;
}

export const analyticsService = {
  async trackEvent(event: Omit<TrackingEvent, 'id' | 'timestamp'>) {
    try {
      await api.post('/analytics/track', event);
    } catch (error) {
      console.error('Falha ao rastrear evento', error);
    }
  },

  async trackEventsBatch(events: Omit<TrackingEvent, 'id' | 'timestamp'>[]) {
    if (events.length === 0) return;
    try {
      await api.post('/analytics/track/batch', events);
    } catch (error) {
      console.error('Falha ao rastrear lote de eventos', error);
    }
  },

  async getHeatmapData(pageUrl: string): Promise<TrackingEvent[]> {
    const { data } = await api.get<TrackingEvent[]>(`/analytics/heatmap?pageUrl=${encodeURIComponent(pageUrl)}`);
    return data;
  },

  async getFunnelData(): Promise<{ visits: number; cartAdds: number; checkouts: number; cartConversionRate: number; checkoutConversionRate: number }> {
    const { data } = await api.get('/analytics/funnel');
    return data;
  }
};
