import React, { useState } from 'react';
import { AlertTriangle, Info, Crosshair, Swords, CheckCircle2, ShieldAlert } from 'lucide-react';
const BACKEND_URL = 'http://localhost:8080';
export default function ThreatLog({ alerts, onAcknowledge }) {
  const [filter, setFilter] = useState('ALL');
  const unackCount = alerts.filter((a) => !a.acknowledged).length;
  const critCount  = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const warnCount  = alerts.filter((a) => a.severity === 'WARNING').length;
  const filteredAlerts = alerts.filter(a => filter === 'ALL' || a.severity === filter);
  function handleTrack(alert) {
    window.dispatchEvent(new CustomEvent('c2:track', { detail: alert }));
  }
  function handleDeclareHostile(alert) {
    fetch(`${BACKEND_URL}/api/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...alert,
        severity: 'CRITICAL',
        threatType: `HOSTILE_${alert.threatType}`,
        source: 'C2_OPERATOR',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {}
      <div className="flex justify-between items-center px-3 py-2 shrink-0 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-[11px] font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
          <ShieldAlert size={13} className={unackCount > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} />
          Live Threat Feed
        </h2>
        {unackCount > 0 && (
          <span className="text-[9px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
            {unackCount} NEW
          </span>
        )}
      </div>
      {}
      <div className="flex gap-1 mx-2 my-1.5 bg-slate-100 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
        {[['ALL', alerts.length], ['CRITICAL', critCount], ['WARNING', warnCount]].map(([label, count]) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            className={`flex-1 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${
              filter === label
                ? label === 'CRITICAL' ? 'bg-red-500 text-white shadow-sm'
                : label === 'WARNING'  ? 'bg-amber-500 text-white shadow-sm'
                :                        'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {label === 'CRITICAL' ? 'CRIT' : label === 'WARNING' ? 'WARN' : 'ALL'} ({count})
          </button>
        ))}
      </div>
      {}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1.5">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-500">
            <ShieldAlert size={24} className="opacity-40" />
            <span className="text-[10px] font-semibold tracking-wide uppercase">No Active Threats</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            const isAck  = alert.acknowledged;
            const conf   = Math.round((alert.confidence || 0.9) * 100);
            return (
              <div
                key={alert.id}
                className={`flex flex-col p-2.5 rounded-lg border transition-all duration-200 relative overflow-hidden ${
                  isAck ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 opacity-60'
                  : isCrit ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20'
                  :          'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20'
                }`}
              >
                {}
                {!isAck && (
                  <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isCrit ? 'bg-red-500' : 'bg-amber-500'}`} />
                )}
                {}
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                    {isCrit
                      ? <AlertTriangle size={11} className="text-red-500" />
                      : <Info size={11} className="text-amber-500" />
                    }
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isCrit ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{alert.timestamp}</span>
                </div>
                {}
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight break-words">{alert.threatType}</span>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0 uppercase">{alert.source || 'EDGE_AI'}</span>
                </div>
                {}
                {alert.coordinates && (
                  <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mb-1.5">
                    📍 {alert.coordinates.lat?.toFixed(5)}, {alert.coordinates.lng?.toFixed(5)}
                  </div>
                )}
                {}
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isCrit ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${conf}%` }} />
                  </div>
                  <span className={`text-[9px] font-bold font-mono ${isCrit ? 'text-red-500' : 'text-amber-500'}`}>{conf}%</span>
                </div>
                {}
                {!isAck ? (
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => handleTrack(alert)}
                      className="flex items-center justify-center gap-1 py-1 text-[9px] font-bold uppercase border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md bg-white dark:bg-slate-900 transition-colors">
                      <Crosshair size={10} /> Track
                    </button>
                    {isCrit ? (
                      <button onClick={() => handleDeclareHostile(alert)}
                        className="flex items-center justify-center gap-1 py-1 text-[9px] font-bold uppercase bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors">
                        <Swords size={10} /> Intercept
                      </button>
                    ) : (
                      <button onClick={() => onAcknowledge(alert.id)}
                        className="flex items-center justify-center gap-1 py-1 text-[9px] font-bold uppercase bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors">
                        <CheckCircle2 size={10} /> Ack
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 py-1 text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 rounded-md">
                    <CheckCircle2 size={10} /> Acknowledged
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
