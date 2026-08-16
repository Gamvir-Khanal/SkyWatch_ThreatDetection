import React, { useState, useEffect } from 'react';
import { Camera, Eye, ScanSearch, Crosshair, MapPin, Video, Target } from 'lucide-react';
const SENSOR_MODES = {
  RGB: { label: 'Optical RGB', title: 'ELECTRO-OPTICAL', color: '#10b981', overlayClass: '' },
  FLIR: { label: 'FLIR Thermal', title: 'THERMAL/IR', color: '#f43f5e', overlayClass: 'mix-blend-color bg-red-500/40 backdrop-contrast-150 backdrop-saturate-200' },
};
export default function OpticsFeed({ telemetry }) {
  const [mode, setMode] = useState('RGB');
  const [aiTracking, setAiTracking] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [videoKey, setVideoKey] = useState(Date.now());
  const [boxes, setBoxes] = useState([
    { id: 1, type: 'PERSON',  conf: 0.94, x: 25, y: 30, w: 8,  h: 22 },
    { id: 2, type: 'VEHICLE', conf: 0.82, x: 60, y: 55, w: 15, h: 14 },
    { id: 3, type: 'PERSON',  conf: 0.77, x: 42, y: 70, w: 6,  h: 18 }
  ]);
  useEffect(() => {
    if (!aiTracking) return;
    const id = setInterval(() => {
      setBoxes(prev => prev.map(b => ({
        ...b,
        x: b.x + (Math.random() - 0.5) * 0.4,
        y: b.y + (Math.random() - 0.5) * 0.4,
        conf: Math.min(0.99, Math.max(0.60, b.conf + (Math.random() - 0.5) * 0.05))
      })));
    }, 250);
    return () => clearInterval(id);
  }, [aiTracking]);
  const alt     = telemetry?.position?.altitudeMeters || 57;
  const speed   = telemetry?.metrics?.speedKmh ? (telemetry.metrics.speedKmh / 3.6).toFixed(1) : 13;
  const heading = telemetry?.metrics?.headingDeg || 180;
  const lat     = telemetry?.position?.latitude  || 22.5726;
  const lng     = telemetry?.position?.longitude || 88.3639;
  const current = SENSOR_MODES[mode];
  return (
        <div className="flex flex-col w-full h-full overflow-hidden">
      {}
      <div className="flex justify-between items-center px-3 py-1.5 shrink-0 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-[11px] font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
          <Camera size={13} className="text-emerald-500" />
          Tactical Optics Feed
        </h2>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500 text-[9px] font-bold tracking-widest uppercase">
          <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
          LIVE REC
        </div>
      </div>
      {}
      <div className="relative flex-1 min-h-0 bg-black overflow-hidden">
        {}
        <div className="absolute inset-0 pointer-events-none">
          <img
            key={videoKey}
            src={`http://localhost:5050/video_feed?t=${videoKey}`}
            alt="Live Tactical Feed"
            className="w-full h-full object-cover pointer-events-none"
            onError={() => {
              setTimeout(() => {
                setVideoKey(Date.now());
              }, 2000);
            }}
          />
        </div>
        {}
        <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${current.overlayClass}`} />
        {}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.07)_2px,rgba(0,0,0,0.07)_4px)] pointer-events-none" />
        {}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full border backdrop-blur-sm z-10 uppercase tracking-widest"
          style={{ borderColor: current.color, color: current.color, background: `${current.color}15` }}
        >
          {current.title} ONLINE
        </div>
        {}
        {showHUD && (
          <>
            {}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 text-xs font-mono font-bold text-emerald-400 bg-black/60 px-3 py-2 rounded-lg border border-emerald-500/30 backdrop-blur-md">
              <div className="flex justify-between gap-4"><span className="text-emerald-400/60">ALT</span><span>{alt}m</span></div>
              <div className="flex justify-between gap-4"><span className="text-emerald-400/60">SPD</span><span>{speed} m/s</span></div>
            </div>
            {}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 text-xs font-mono font-bold text-emerald-400 bg-black/60 px-3 py-2 rounded-lg border border-emerald-500/30 backdrop-blur-md">
              <div className="flex justify-between gap-4"><span className="text-emerald-400/60">HDG</span><span>{heading}°</span></div>
              <div className="flex justify-between gap-4"><span className="text-emerald-400/60">CAM</span><span>35x ZOOM</span></div>
            </div>
            {}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-28 h-28 border border-emerald-500/40 rounded-full flex items-center justify-center relative">
                <div className="w-20 h-20 border border-dashed border-emerald-500/60 rounded-full flex items-center justify-center">
                  <Target className="text-emerald-500/80" size={22} />
                </div>
                <div className="absolute top-1/2 -left-5 w-5 h-px bg-emerald-500/60" />
                <div className="absolute top-1/2 -right-5 w-5 h-px bg-emerald-500/60" />
                <div className="absolute left-1/2 -top-5 w-px h-5 bg-emerald-500/60" />
                <div className="absolute left-1/2 -bottom-5 w-px h-5 bg-emerald-500/60" />
              </div>
            </div>
            {}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/60 border border-emerald-500/30 px-4 py-1.5 rounded-full backdrop-blur-md text-xs font-mono font-bold text-emerald-400 tracking-wider whitespace-nowrap">
              <MapPin size={12} className="text-emerald-500" />
              TGT: {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
            </div>
          </>
        )}
        {}
      </div>
      {}
      <div className="flex items-center gap-1.5 px-2 py-1.5 shrink-0 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
        <div className="flex p-0.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-md">
          {Object.entries(SENSOR_MODES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${mode === key ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {key === 'RGB' ? <Video size={11} /> : <Eye size={11} />}
              {val.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setShowHUD(v => !v)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border ${showHUD ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Crosshair size={11} /> HUD
        </button>
        <button
          onClick={() => setAiTracking(v => !v)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border ${aiTracking ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <ScanSearch size={11} /> AI TRACKING
        </button>
      </div>
    </div>
  );
}
