import React from 'react';
import { ArrowUp, Wind, Battery, Compass, RadioTower } from 'lucide-react';
export default function TelemetryStrip({ telemetry }) {
  const alt      = telemetry?.position?.altitudeMeters || 57;
  const speedKmh = telemetry?.metrics?.speedKmh || 46.8;
  const speedMs  = (speedKmh / 3.6).toFixed(1);
  const battery  = telemetry?.metrics?.batteryPercent || 82;
  const heading  = telemetry?.metrics?.headingDeg || 315;
  const status   = telemetry?.status || 'IDLE';
  const droneId  = telemetry?.droneId || 'DRONE-01';
  const getCardinal = (deg) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8];
  };
  const cardinal = getCardinal(heading);
  const handleModeChange = (newMode) => {
    fetch(`http://localhost:8080/api/drones/${droneId}/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newMode })
    }).catch(err => console.error('Mode update failed', err));
  };
  const card = 'h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between px-3 shadow-sm';
  const iconBubble = (cls) => `w-7 h-7 rounded-full flex items-center justify-center border ${cls}`;
  return (
    <div className="flex items-stretch gap-2 w-full">
      {}
      <div className={`flex-1 ${card}`}>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Alt</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-none">{alt}m</span>
        </div>
        <div className={iconBubble('bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20')}>
          <ArrowUp size={14} className="text-emerald-500" />
        </div>
      </div>
      {}
      <div className={`flex-1 ${card}`}>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Speed</span>
          <span className="text-sm font-bold text-sky-600 dark:text-sky-400 leading-none">{speedMs} <span className="text-[10px] text-slate-400">m/s</span></span>
        </div>
        <div className={iconBubble('bg-sky-100 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20')}>
          <Wind size={14} className="text-sky-500" />
        </div>
      </div>
      {}
      <div className={`flex-1 ${card} relative overflow-hidden`}>
        <div className="flex flex-col z-10">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Battery</span>
          <span className={`text-sm font-bold leading-none ${battery > 25 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 animate-pulse'}`}>{battery}%</span>
        </div>
        <div className={`z-10 ${iconBubble(battery > 25 ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' : 'bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20')}`}>
          <Battery size={14} className={battery > 25 ? 'text-amber-500' : 'text-red-500'} />
        </div>
        <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-700 ${battery > 25 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${Math.min(100, Math.max(0, battery))}%` }} />
      </div>
      {}
      <div className={`flex-1 ${card}`}>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Heading</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-none">{heading}° <span className="text-[10px] text-slate-400">{cardinal}</span></span>
        </div>
        <div className={iconBubble('bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20')}>
          <Compass size={14} className="text-emerald-500 transition-transform duration-500" style={{ transform: `rotate(${heading}deg)` }} />
        </div>
      </div>
    </div>
  );
}
