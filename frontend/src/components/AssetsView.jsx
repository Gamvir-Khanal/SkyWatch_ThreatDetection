import React, { useState, useEffect } from 'react';
import { Plane, AlertTriangle, CheckCircle2, Wrench, Battery, Crosshair, Radar, Info } from 'lucide-react';
const BACKEND_URL = 'http://localhost:8080';
function AssetCard({ asset, onScheduleMaintenance }) {
  const { _id, name, type, callsign, status, maintenanceScheduled, icon, theme, diagnostics } = asset;
  const isError = theme === 'error';
  const isOrange = theme === 'orange';
  let cardClass = "bg-white dark:bg-slate-900 border rounded-xl p-4 flex flex-col shadow-sm transition-all ";
  if (isError) {
    cardClass += maintenanceScheduled
      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10'
      : 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20';
  } else if (isOrange) {
    cardClass += 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20';
  } else {
    cardClass += 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';
  }
  let tagClass = "px-2 py-0.5 text-[9px] font-bold rounded uppercase flex items-center gap-1 border ";
  let tagText = "";
  let TagIcon = null;
  if (isError) {
    if (maintenanceScheduled) {
      tagClass += 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400';
      tagText = 'MAINT SCHEDULED';
      TagIcon = Wrench;
    } else {
      tagClass += 'bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 animate-pulse';
      tagText = 'MAINT REQ';
      TagIcon = AlertTriangle;
    }
  } else if (isOrange) {
    tagClass += 'bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400';
    tagText = 'MINOR WEAR';
    TagIcon = Info;
  } else {
    tagClass += 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400';
    tagText = 'NOMINAL';
    TagIcon = CheckCircle2;
  }
  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3 border-b border-slate-200 dark:border-slate-800/60 pb-3">
        <div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase">
            <Plane size={16} className={isError ? "text-red-500" : isOrange ? "text-amber-500" : "text-emerald-500"} />
            {name}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 font-semibold">CALLSIGN: {callsign}</div>
        </div>
        <div className={tagClass}>
          <TagIcon size={10} />
          {tagText}
        </div>
      </div>
      {}
      <div className="space-y-2 text-[10px] font-mono font-semibold flex-1">
         <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/40 pb-1.5">
          <span className="text-slate-400 dark:text-slate-500">STATUS</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">{status}</span>
        </div>
        {diagnostics?.fuelLevel && (
         <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/40 pb-1.5">
          <span className="text-slate-400 dark:text-slate-500">FUEL LEVEL</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">{diagnostics.fuelLevel}</span>
        </div>
        )}
        {}
        {diagnostics?.alerts && diagnostics.alerts.length > 0 && (
        <div className={`mt-3 p-2.5 rounded-lg border ${
          isError ? "border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30" :
          isOrange ? "border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30" :
          "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
        }`}>
           <div className={`text-[10px] font-bold mb-2 flex items-center gap-1 uppercase tracking-wider ${
             isError ? "text-red-600 dark:text-red-400" : isOrange ? "text-amber-600 dark:text-amber-400" : "text-slate-500"
           }`}>
             {isError ? <AlertTriangle size={12} /> : isOrange ? <Info size={12} /> : <Wrench size={12} />}
             {diagnostics.title || 'DIAGNOSTICS'}
           </div>
           <div className="space-y-1.5">
             {diagnostics.alerts.map((alert, idx) => (
               <div key={idx} className="flex justify-between items-center text-[9px] border-b border-black/5 dark:border-white/5 last:border-0 pb-1 last:pb-0">
                 <span className="text-slate-500 dark:text-slate-400">{alert.label}</span>
                 <span className={`font-bold ${
                   alert.isError ? 'text-red-600 dark:text-red-400' :
                   alert.isWarning ? 'text-amber-600 dark:text-amber-400' :
                   alert.isInfo ? 'text-slate-600 dark:text-slate-300' : 'text-emerald-600 dark:text-emerald-400'
                 } ${alert.isPulse ? 'animate-pulse' : ''}`}>
                   {alert.value}
                 </span>
               </div>
             ))}
           </div>
        </div>
        )}
      </div>
      {}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex gap-2">
        {isError && (
          <button
            onClick={() => onScheduleMaintenance(_id)}
            disabled={maintenanceScheduled}
            className={`flex-1 py-1.5 rounded-md transition-all text-[10px] font-bold border uppercase flex items-center justify-center gap-1.5 ${
              maintenanceScheduled
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 border-red-600 text-white shadow-sm'
            }`}
          >
            <Wrench size={12} />
            {maintenanceScheduled ? 'REPAIR SCHEDULED' : 'SCHEDULE MAINT'}
          </button>
        )}
      </div>
    </div>
  );
}
export default function AssetsView({ telemetry }) {
  const battery = telemetry?.metrics?.batteryPercent || 100;
  const [assets, setAssets] = useState([]);
  useEffect(() => {
    Promise.all([
      fetch(`${BACKEND_URL}/api/assets`).then(res => res.json()),
      fetch(`${BACKEND_URL}/api/drones`).then(res => res.json())
    ])
    .then(([assetsData, dronesData]) => {
      let combined = [];
      if (assetsData.success && assetsData.assets) {
        combined = [...assetsData.assets];
      }
      if (dronesData.success && dronesData.drones) {
        const droneAssets = dronesData.drones.map(d => ({
          _id: d.droneId,
          name: d.droneId,
          type: 'UAV',
          callsign: d.callsign || 'UNKNOWN',
          status: d.status || 'ACTIVE',
          maintenanceScheduled: false,
          theme: d.status === 'EMERGENCY' ? 'error' : d.status === 'RTH' ? 'orange' : 'default',
          diagnostics: {
            title: 'DRONE TELEMETRY',
            fuelLevel: `BATTERY: ${Math.floor(d.telemetry?.battery || 100)}%`,
            alerts: [
              { label: 'SECTOR', value: d.sector || 'UNKNOWN', isInfo: true },
              { label: 'ALTITUDE', value: `${d.telemetry?.altitude || 0}m`, isInfo: true }
            ]
          }
        }));
        combined = [...droneAssets, ...combined];
      }
      setAssets(combined);
    })
    .catch(err => console.error("Failed to load fleet data:", err));
  }, []);
  const handleScheduleMaintenance = (id) => {
    fetch(`${BACKEND_URL}/api/assets/${id}/maintenance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maintenanceScheduled: true })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAssets(prev => prev.map(a => a._id === id ? { ...a, maintenanceScheduled: true } : a));
        }
      })
      .catch(err => console.error("Failed to schedule maintenance:", err));
  };
  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {}
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-sm">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase flex items-center gap-2">
            <Wrench size={16} className="text-emerald-500" />
            Asset Fleet & Predictive Maintenance
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 font-semibold">
            REAL-TIME DIAGNOSTICS • FLEET READINESS • AUTOMATED RTL COMMANDS
          </p>
        </div>
      </div>
      {}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-4">
          {}
          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 flex flex-col shadow-sm relative overflow-hidden">
            {}
            <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 pointer-events-none" />
            <div className="flex justify-between items-start mb-3 border-b border-emerald-100 dark:border-emerald-900/50 pb-3 relative z-10">
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase">
                  <Plane size={16} className="text-emerald-500" />
                  {telemetry?.droneId || 'SKYW-DRONE-01'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 font-semibold">CALLSIGN: {telemetry?.callsign || 'VANGUARD-LEADER'}</div>
              </div>
              <div className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold rounded uppercase animate-pulse flex items-center gap-1">
                <Crosshair size={10} />
                {telemetry?.status || 'ACTIVE_PATROL'}
              </div>
            </div>
            <div className="space-y-2 text-[10px] font-mono font-semibold relative z-10 flex-1">
              <div className="flex justify-between border-b border-emerald-50 dark:border-emerald-900/30 pb-1.5">
                <span className="text-slate-400 dark:text-slate-500">FLIGHT MODE</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">{telemetry?.flightMode || 'AUTONOMOUS'}</span>
              </div>
              <div className="flex justify-between border-b border-emerald-50 dark:border-emerald-900/30 pb-1.5">
                <span className="text-slate-400 dark:text-slate-500">BATTERY</span>
                <span className={`font-bold flex items-center gap-1 ${battery < 20 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  <Battery size={12} /> {battery}%
                </span>
              </div>
              <div className="flex justify-between border-b border-emerald-50 dark:border-emerald-900/30 pb-1.5">
                <span className="text-slate-400 dark:text-slate-500">SENSORS</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                  <Radar size={12} className="text-sky-500" /> EO/IR, LIDAR
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400 dark:text-slate-500">PREDICTIVE MAINT</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">NOMINAL (92%)</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/50 flex gap-2 relative z-10">
              <button
                onClick={() => {
                  fetch(`${BACKEND_URL}/api/drones/${telemetry?.droneId || 'SKYW-DRONE-01'}/mode`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: 'RTH' })
                  });
                }}
                className="flex-1 py-1.5 rounded-md transition-all text-[10px] font-bold border uppercase flex items-center justify-center gap-1 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
              >
                FORCE RTL
              </button>
            </div>
          </div>
          {}
          {assets
            .filter(asset => asset._id !== (telemetry?.droneId || 'SKYW-DRONE-01'))
            .map(asset => (
              <AssetCard
                key={asset._id}
                asset={asset}
                onScheduleMaintenance={handleScheduleMaintenance}
              />
          ))}
        </div>
      </div>
    </div>
  );
}
