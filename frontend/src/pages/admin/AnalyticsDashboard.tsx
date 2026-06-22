import React, { useEffect, useState } from 'react';
import { analyticsService, TrackingEvent } from '../../services/analyticsService';
import { MousePointerClick, Eye, ShoppingCart, CreditCard, Activity } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const [funnel, setFunnel] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<TrackingEvent[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const funnelData = await analyticsService.getFunnelData();
      setFunnel(funnelData);
      loadHeatmap(selectedPage);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHeatmap = async (pageUrl: string) => {
    setSelectedPage(pageUrl);
    try {
      const heatmap = await analyticsService.getHeatmapData(pageUrl);
      setHeatmapData(heatmap);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Activity className="animate-spin text-blue-500 w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <MousePointerClick className="text-blue-500" /> Pixel & Analytics
        </h1>
        <p className="text-sm text-zinc-500">Métricas de conversão e mapa de calor do comportamento dos utilizadores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl mb-4">
            <Eye size={24} />
          </div>
          <h3 className="text-zinc-500 text-sm font-medium">Visitas Únicas</h3>
          <p className="text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">{funnel?.visits || 0}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl mb-4">
            <ShoppingCart size={24} />
          </div>
          <h3 className="text-zinc-500 text-sm font-medium">Add ao Carrinho</h3>
          <p className="text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">{funnel?.cartAdds || 0}</p>
          <span className="text-xs font-semibold text-emerald-500 mt-2 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
            {funnel?.cartConversionRate || 0}% de Conversão
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl mb-4">
            <CreditCard size={24} />
          </div>
          <h3 className="text-zinc-500 text-sm font-medium">Checkouts Completos</h3>
          <p className="text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">{funnel?.checkouts || 0}</p>
          <span className="text-xs font-semibold text-emerald-500 mt-2 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
            {funnel?.checkoutConversionRate || 0}% de Conversão
          </span>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg flex flex-col justify-center text-white">
          <h3 className="text-blue-100 text-sm font-medium">Taxa de Sucesso Global</h3>
          <p className="text-4xl font-extrabold mt-1">{funnel?.checkoutConversionRate || 0}%</p>
          <p className="text-xs text-blue-200 mt-2">Pessoas que entram e compram.</p>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Visualizador de Mapa de Calor (Heatmap)</h2>
            <p className="text-xs text-zinc-500">Zonas exatas onde os utilizadores clicaram.</p>
          </div>
          <select 
            value={selectedPage} 
            onChange={(e) => loadHeatmap(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
          >
            <option value="/">Página Inicial (/)</option>
            <option value="/catalogo">Catálogo</option>
            <option value="/carrinho">Carrinho</option>
          </select>
        </div>

        <div className="relative w-full h-[600px] bg-zinc-100 dark:bg-zinc-950 overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
          {/* Iframe to render the actual page layout in the background */}
          <iframe 
            src={selectedPage} 
            className="w-full h-full opacity-50 pointer-events-none" 
            title="Preview"
          />

          {/* Heatmap Dots Layer */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {heatmapData.map((point, idx) => {
              if (!point.x || !point.y) return null;
              
              // Simplistic responsive scaling (assuming window width of 1440px max)
              const scaleX = point.screenWidth ? window.innerWidth / point.screenWidth : 1;
              const scaleY = point.screenHeight ? 600 / point.screenHeight : 1;

              return (
                <div
                  key={idx}
                  className="absolute rounded-full bg-rose-500/60 blur-[3px]"
                  style={{
                    left: point.x * scaleX - 15,
                    top: point.y * scaleY - 15,
                    width: 30,
                    height: 30,
                    boxShadow: '0 0 15px 5px rgba(244, 63, 94, 0.4)'
                  }}
                  title={`Click at X:${point.x} Y:${point.y} on ${point.elementId || point.elementClass || 'Unknown'}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
