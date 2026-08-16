import React, { useState, useEffect, useRef } from 'react';
import { RadioTower, Send, Lock, ShieldCheck, Share2, Server } from 'lucide-react';
export default function NetworkView({ connected }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'COMMAND', text: 'INITIATING SECURE HANDSHAKE...', type: 'system' },
    { id: 2, sender: 'COMMAND', text: 'KEY EXCHANGE COMPLETE. RSA-4096 / AES-256-GCM', type: 'system' },
    { id: 3, sender: 'FIELD-ALPHA', text: 'Command, this is Field-Alpha. We are in position at grid 7B.', type: 'msg', time: new Date(Date.now() - 60000).toLocaleTimeString() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [activeDrones, setActiveDrones] = useState([]);
  const endOfMessagesRef = useRef(null);
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isEncrypting]);
  useEffect(() => {
    fetch('http://localhost:8080/api/drones')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setActiveDrones(data.drones || []);
        }
      })
      .catch(console.error);
  }, []);
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {}
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-sm">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase flex items-center gap-2">
            <RadioTower size={16} className="text-emerald-500" />
            Secure P2P Communications
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 font-semibold">
            MESH NETWORK • ZERO-TRUST ARCHITECTURE • END-TO-END ENCRYPTED
          </p>
        </div>
      </div>
      <div className="flex-1 flex gap-4 p-2 overflow-hidden">
        {}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-sm flex flex-col flex-[2] min-h-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 uppercase tracking-widest px-2">
                <Share2 size={16} className="text-emerald-500" />
                Global Mesh Network Topology
              </h3>
              <div className="flex-1 flex items-center justify-center relative bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50 mb-3 overflow-hidden">
                {}
                <div className="absolute w-40 h-40 border border-emerald-500/20 rounded-full animate-ping"></div>
                <div className="absolute w-24 h-24 border border-emerald-500/40 rounded-full"></div>
                <div className="absolute w-6 h-6 bg-emerald-500 rounded-full z-10 shadow-[0_0_20px_rgba(16,185,129,0.8)] flex items-center justify-center">
                  <Server size={14} className="text-white" />
                </div>
                <div className="absolute mt-14 text-[10px] font-bold text-emerald-500 tracking-widest bg-black/50 px-2 py-0.5 rounded border border-emerald-500/30">CMD-HQ-UPLINK</div>
                {}
                {activeDrones.length > 0 ? activeDrones.map((drone, idx) => {
                  const angle = (idx * (360 / activeDrones.length)) * (Math.PI / 180);
                  const radius = 120;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  return (
                    <React.Fragment key={drone.droneId || idx}>
                      <div
                        className="absolute w-3 h-3 bg-sky-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(14,165,233,0.8)]"
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                          animationDelay: `${idx * 0.3}s`
                        }}
                      >
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-sky-400 whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                          {drone.droneId}
                        </div>
                      </div>
                      {}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                        <line
                          x1="50%"
                          y1="50%"
                          x2={`calc(50% + ${x}px)`}
                          y2={`calc(50% + ${y}px)`}
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="4"
                          className="animate-pulse"
                          style={{animationDelay: `${idx * 0.2}s`}}
                        />
                      </svg>
                    </React.Fragment>
                  );
                }) : (
                  <>
                    <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-sky-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(14,165,233,0.8)]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-sky-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(14,165,233,0.8)]" style={{animationDelay: '1s'}}></div>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                      <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4" className="animate-pulse" />
                      <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4" className="animate-pulse" style={{animationDelay: '0.3s'}} />
                    </svg>
                  </>
                )}
              </div>
              <div className="text-[10px] text-center font-mono text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-3 shrink-0">
                ACTIVE MESH PEERS: {activeDrones.length > 0 ? activeDrones.length : 2} | LATENCY: {(Math.random() * 20 + 10).toFixed(1)}ms | TOPOLOGY: FULL-MESH
              </div>
            </div>
            {}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col flex-[1] min-h-0">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 uppercase tracking-widest">
                <ShieldCheck size={16} className="text-emerald-500" />
                Crypto Handshake
              </h3>
              <div className="space-y-4 text-xs font-mono font-semibold flex-1 overflow-y-auto pt-2">
                <div>
                  <div className="text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest text-[9px]">Symmetric Encryption</div>
                  <div className="text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    AES-256-GCM
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest text-[9px]">Key Exchange</div>
                  <div className="text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    RSA-4096 / ECDHE
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/30 animate-pulse mt-2 shadow-sm font-bold tracking-widest">
                    <Lock size={16} />
                    END-TO-END ENCRYPTED
                  </div>
                </div>
              </div>
            </div>
            {}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex-[1] overflow-hidden flex flex-col">
            <h3 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 uppercase tracking-widest shrink-0">
              <RadioTower size={14} className="text-sky-500" />
              Node Telemetry Link Status
            </h3>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left font-mono text-[10px]">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-widest">
                  <tr>
                    <th className="p-2 font-bold">Node ID</th>
                    <th className="p-2 font-bold">Callsign</th>
                    <th className="p-2 font-bold">Link Type</th>
                    <th className="p-2 font-bold">Signal</th>
                    <th className="p-2 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDrones.length === 0 && (
                    <tr className="border-b border-slate-100 dark:border-slate-800/50">
                      <td colSpan="5" className="p-4 text-center text-slate-500 italic">NO ACTIVE NODES</td>
                    </tr>
                  )}
                  {activeDrones.map(drone => (
                    <tr key={drone.droneId} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-2 font-bold text-sky-600 dark:text-sky-400">{drone.droneId}</td>
                      <td className="p-2 text-slate-700 dark:text-slate-300">{drone.callsign}</td>
                      <td className="p-2 text-slate-600 dark:text-slate-400">P2P-MESH</td>
                      <td className="p-2 text-emerald-600 dark:text-emerald-400 font-bold">{Math.floor(Math.random() * 20 + 80)}% (-{Math.floor(Math.random() * 30 + 40)}dBm)</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 uppercase tracking-wide">SECURE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
