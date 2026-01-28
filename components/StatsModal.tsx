import React from 'react';
import { X, Trophy, Calendar, Activity, Clock } from 'lucide-react';
import { Route, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { calculateAnalytics, getTopRoutes } from '../utils/analytics';
import { formatDistance, formatDuration } from '../utils/geo';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: Route[];
  language: Language;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, routes, language }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const stats = calculateAnalytics(routes);
  const topRoutes = getTopRoutes(routes);

  const StatCard = ({ title, distance, calories, duration, count, icon }: any) => (
    <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
      <div className="flex items-center gap-2 mb-3 text-zinc-500">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-xl font-bold text-zinc-900">{formatDistance(distance)}</div>
          <div className="text-[10px] text-zinc-400 font-medium uppercase">{t.distance}</div>
        </div>
        <div>
          <div className="text-xl font-bold text-zinc-900">{formatDuration(duration)}</div>
          <div className="text-[10px] text-zinc-400 font-medium uppercase">{t.time}</div>
        </div>
        <div>
          <div className="text-xl font-bold text-zinc-900">{Math.round(calories)}</div>
          <div className="text-[10px] text-zinc-400 font-medium uppercase">{t.kcal}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center p-0 md:p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full md:max-w-md md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Activity className="text-zinc-900" size={24} />
            <h3 className="font-bold text-xl text-zinc-900">{t.stats}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Stats Grid */}
          <div className="space-y-4">
            <StatCard 
              title={t.daily} 
              distance={stats.daily.distance} 
              duration={stats.daily.duration}
              calories={stats.daily.calories}
              count={stats.daily.count}
              icon={<Calendar size={14} />}
            />
            <StatCard 
              title={t.weekly} 
              distance={stats.weekly.distance} 
              duration={stats.weekly.duration}
              calories={stats.weekly.calories}
              count={stats.weekly.count}
              icon={<Calendar size={14} />}
            />
            <StatCard 
              title={t.monthly} 
              distance={stats.monthly.distance} 
              duration={stats.monthly.duration}
              calories={stats.monthly.calories}
              count={stats.monthly.count}
              icon={<Calendar size={14} />}
            />
          </div>

          {/* Top Routes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-amber-500" size={18} />
              <h4 className="font-bold text-zinc-900">{t.total_routes}: {routes.length}</h4>
            </div>
            
            {routes.length === 0 ? (
               <div className="text-center py-8 text-zinc-400 text-sm italic">
                  {t.no_data}
               </div>
            ) : (
              <div className="space-y-3">
                 <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Longest Trips</p>
                 {topRoutes.map((route, idx) => (
                    <div key={route.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                       <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-zinc-200 rounded-full text-xs font-bold text-zinc-600">
                             {idx + 1}
                          </span>
                          <div className="flex flex-col">
                             <span className="text-sm font-medium text-zinc-900">
                                {new Date(route.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                             </span>
                             <span className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-wide">
                                <span>{formatDistance(route.totalDistance)}</span>
                                <span>•</span>
                                <span>{route.endTime ? formatDuration(route.endTime - route.startTime) : '-'}</span>
                             </span>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-xs font-bold text-zinc-700">
                             {Math.round(route.totalCalories)} {t.kcal}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};