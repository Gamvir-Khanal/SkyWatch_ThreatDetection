import React, { useState, useEffect, useRef } from 'react';
import DroneRegistrationModal from './DroneRegistrationModal';
import { Radar, Activity, ShieldCheck, Wifi, Plus, Lock, Unlock, Settings as SettingsIcon, Bell, X, Moon, Sun, ShieldAlert, Cpu } from 'lucide-react';
const BACKEND_URL = 'http://localhost:8080';
const MAX_LOG = 6;
export default function Navbar({ connected, unackCount, activeTab, setActiveTab, alerts = [], settings, setSettings, isSimulating, setIsSimulating, theme, setTheme, drones = [], selectedDroneId, setSelectedDroneId }) {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [cipherLog, setCipherLog]   = useState([]);
  const logRef                       = useRef(null);
  const [utcTime, setUtcTime]        = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toISOString().substring(11, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    function handleCipher(e) {
      setCipherLog((prev) => [e.detail, ...prev].slice(0, MAX_LOG));
    }
    window.addEventListener('cipher:entry', handleCipher);
    return () => window.removeEventListener('cipher:entry', handleCipher);
  }, []);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [cipherLog]);
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  return (
    <header className="w-full z-50 flex justify-between items-center px-4 h-11 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shrink-0 shadow-sm">
      {}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center truncate">
          Tactical Overview
        </h1>
      </div>
      {}
      <div className="hidden lg:flex items-center justify-center gap-2 shrink-0 text-[10px] font-semibold px-3">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <Cpu size={14} className="text-emerald-500" />
          <span>AI: ONLINE</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>COMM: AES-256 SECURE</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <Wifi size={14} className={connected ? "text-emerald-500" : "text-red-500"} />
          <span>LATENCY: {connected ? '12ms' : 'ERR'}</span>
        </div>
      </div>
      {}
      <div className="flex gap-2 items-center justify-end flex-1 shrink-0">
        {}
        <div className="text-[10px] text-slate-700 dark:text-slate-300 font-mono font-medium hidden xl:block">
          {utcTime || '00:00:00 UTC'}
        </div>
        {}
        {drones && drones.length > 0 && (
          <div className="flex items-center">
            <select
              value={selectedDroneId}
              onChange={(e) => setSelectedDroneId(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold font-mono px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm appearance-none outline-none"
              style={{ WebkitAppearance: 'none' }}
            >
              {drones.map(d => (
                <option key={d.droneId} value={d.droneId}>
                  {d.droneId}
                </option>
              ))}
            </select>
          </div>
        )}
        {}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-semibold shadow-sm whitespace-nowrap"
        >
          <Plus size={14} />
          Add Drone
        </button>
        <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />
        {}
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          {}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            title="Toggle AI Threat Sim"
            className={`p-1.5 rounded-lg transition-colors ${isSimulating ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Activity size={18} className={isSimulating ? 'animate-pulse' : ''} />
          </button>
          {/* Cipher Wire */}
          <button
            onClick={() => setActiveDrawer((d) => d === 'cipher' ? null : 'cipher')}
            title="SEC-OPS Cipher Log"
            className={`p-1.5 rounded-lg transition-colors ${activeDrawer === 'cipher' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Lock size={18} />
          </button>
          {}
          <button
            onClick={() => setActiveDrawer((d) => d === 'settings' ? null : 'settings')}
            className={`p-1.5 rounded-lg transition-colors ${activeDrawer === 'settings' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <SettingsIcon size={18} />
          </button>
          {}
          <button
            onClick={() => setActiveDrawer((d) => d === 'notifications' ? null : 'notifications')}
            className={`relative p-1.5 rounded-lg transition-colors ${activeDrawer === 'notifications' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Bell size={18} />
            {unackCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            )}
            {unackCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>
      {}
      {activeDrawer === 'cipher' && (
        <div className="absolute top-11 right-6 w-[520px] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 tracking-widest flex items-center gap-2">
              <Lock size={14} />
              SYSTEM AUDIT / ENCRYPTION LOGS
            </span>
            <button onClick={() => setActiveDrawer(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={16}/></button>
          </div>
          <div ref={logRef} className="max-h-96 overflow-y-auto p-4 space-y-3 font-mono bg-slate-50 dark:bg-slate-900/50">
            {cipherLog.length === 0 ? (
              <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center py-10 uppercase tracking-widest animate-pulse font-bold">
                Awaiting encrypted packets...
              </div>
            ) : (
              cipherLog.map((entry, i) => (
                <div key={i} className="border border-slate-200 dark:border-slate-700/50 rounded-lg bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
                  {}
                  <div className="flex justify-between items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{entry.event}</span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase">
                      <ShieldCheck size={10} />
                      AES-256-GCM OK
                    </span>
                  </div>
                  {}
                  <div className="flex flex-row divide-x divide-slate-100 dark:divide-slate-800 text-[9px]">
                    {}
                    <div className="flex-1 p-3 bg-red-50/30 dark:bg-red-500/5">
                      <div className="text-red-600 dark:text-red-400 font-bold mb-1.5 flex items-center gap-1 uppercase tracking-widest">
                        <Lock size={10} /> WIRE (ENCRYPTED)
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 break-all leading-tight">
                        <span className="text-slate-400 dark:text-slate-500">IV:</span> {entry.iv?.slice(0, 16)}…<br/>
                        <span className="text-slate-400 dark:text-slate-500">CT:</span> {entry.ciphertext?.slice(0, 24)}…<br/>
                        <span className="text-slate-400 dark:text-slate-500">TAG:</span> {entry.authTag?.slice(0, 16)}…
                      </div>
                    </div>
                    {}
                    <div className="flex-1 p-3 bg-emerald-50/30 dark:bg-emerald-500/5">
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold mb-1.5 flex items-center gap-1 uppercase tracking-widest">
                        <Unlock size={10} /> DECRYPTED
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 break-all leading-tight">
                        {entry.preview}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {}
      {activeDrawer === 'settings' && (
        <div className="absolute top-11 right-6 w-[320px] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-widest flex items-center gap-2">
              <SettingsIcon size={14} />
              TACTICAL SETTINGS
            </span>
            <button onClick={() => setActiveDrawer(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={16}/></button>
          </div>
          <div className="p-4 space-y-4">
            <label className="flex items-center justify-between cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Auto-Acknowledge Warnings</span>
              <div className={`w-8 h-4 rounded-full flex items-center transition-colors px-0.5 ${settings?.autoAck ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings?.autoAck ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={settings?.autoAck || false} onChange={e => setSettings(s => ({...s, autoAck: e.target.checked}))} />
            </label>
            <label className="flex items-center justify-between cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Audio Alarms</span>
              <div className={`w-8 h-4 rounded-full flex items-center transition-colors px-0.5 ${settings?.audioAlarms ?? true ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings?.audioAlarms ?? true ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={settings?.audioAlarms ?? true} onChange={e => setSettings(s => ({...s, audioAlarms: e.target.checked}))} />
            </label>
            <label className="flex items-center justify-between cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">High Contrast Map</span>
              <div className={`w-8 h-4 rounded-full flex items-center transition-colors px-0.5 ${settings?.highContrast ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings?.highContrast ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={settings?.highContrast || false} onChange={e => setSettings(s => ({...s, highContrast: e.target.checked}))} />
            </label>
            <label className="flex items-center justify-between cursor-pointer group bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Data Saver Mode</span>
              <div className={`w-8 h-4 rounded-full flex items-center transition-colors px-0.5 ${settings?.dataSaver ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings?.dataSaver ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={settings?.dataSaver || false} onChange={e => setSettings(s => ({...s, dataSaver: e.target.checked}))} />
            </label>
            <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 text-center font-mono font-bold tracking-widest">
              SYSTEM v2.0.0-DEFENCE
            </div>
          </div>
        </div>
      )}
      {}
      {activeDrawer === 'notifications' && (
        <div className="absolute top-11 right-6 w-[360px] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-red-50 dark:bg-red-900/10">
            <span className="text-xs font-bold text-red-600 dark:text-red-500 tracking-widest flex items-center gap-2">
              <ShieldAlert size={14} />
              ACTIVE THREATS
            </span>
            <button onClick={() => setActiveDrawer(null)} className="text-red-400 hover:text-red-600"><X size={16}/></button>
          </div>
          <div className="max-h-80 overflow-y-auto p-3 space-y-3">
            {alerts.filter(a => !a.acknowledged).length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                No active threat notifications.
              </div>
            ) : (
              alerts.filter(a => !a.acknowledged).slice(0, 5).map((alert) => (
                <div key={`notif-${alert.id}`} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" onClick={() => setActiveTab('tactical')}>
                  <div className="flex justify-between items-start mb-1 text-xs font-mono">
                    <span className="font-bold text-red-600 dark:text-red-400">{alert.severity}</span>
                    <span className="text-red-500/70">{alert.timestamp}</span>
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300 font-bold mb-1">{alert.threatType}</div>
                  <div className="text-xs text-red-600/70 dark:text-red-400/70 font-mono">LOC: {alert.coordinates?.lat?.toFixed(4)}, {alert.coordinates?.lng?.toFixed(4)}</div>
                </div>
              ))
            )}
          </div>
          {unackCount > 0 && (
             <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900/50">
               <button onClick={() => setActiveTab('tactical')} className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider hover:text-slate-900 dark:hover:text-white transition-colors">
                 VIEW ALL IN TACTICAL LOG ({unackCount})
               </button>
             </div>
          )}
        </div>
      )}
      <DroneRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}
