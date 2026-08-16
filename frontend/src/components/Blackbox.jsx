import React, { useEffect, useState } from 'react';
import { Archive, Download, ShieldAlert, CheckCircle2, Video, ChevronDown, ChevronUp, Crosshair } from 'lucide-react';
const BACKEND_URL = 'http://localhost:8080';
const THREAT_COLORS = {
  INFO: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
  WARNING: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  CRITICAL: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  SEVERE: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
};
export default function Blackbox() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [expandedRow, setExpandedRow] = useState(null);
  useEffect(() => {
    fetchIncidents();
  }, [filterSeverity]);
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/api/alerts/history`;
      if (filterSeverity !== 'ALL') {
        url += `?severity=${filterSeverity}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setIncidents(data.incidents);
      }
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setLoading(false);
    }
  };
  const handleExport = () => {
    if (incidents.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Threat Type', 'Level', 'Confidence', 'Coordinates', 'Status'];
    const rows = incidents.map(inc => [
      inc._id,
      new Date(inc.timestamp).toISOString(),
      inc.objectType || inc.threatType,
      inc.threatLevel || inc.severity,
      (inc.confidence * 100).toFixed(1) + '%',
      `${inc.coordinates?.lat}, ${inc.coordinates?.lng}`,
      inc.acknowledged ? 'ACKNOWLEDGED' : 'PENDING'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `SkyWatch_Blackbox_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-skywatch-bg border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      {}
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div>
          <h2 className="text-lg font-bold tracking-widest text-slate-800 dark:text-slate-100 uppercase flex items-center gap-2">
            <Archive size={20} className="text-skywatch-emerald" />
            INCIDENT VAULT (BLACKBOX)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 font-semibold uppercase">
            IMMUTABLE SEC-OPS RECORD • AES-256 ENCRYPTED
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-mono font-bold px-3 py-1.5 uppercase focus:outline-none focus:border-skywatch-emerald transition-colors cursor-pointer"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="SEVERE">SEVERE</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="WARNING">WARNING</option>
            <option value="INFO">INFO</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-skywatch-emerald/10 border border-skywatch-emerald/30 text-skywatch-emerald hover:bg-skywatch-emerald/20 transition-colors shadow-sm"
          >
            <Download size={14} /> EXPORT
          </button>
        </div>
      </div>
      {}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#050810]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-skywatch-emerald font-mono font-bold animate-pulse">
            DECRYPTING ARCHIVES...
          </div>
        ) : incidents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-3">
            <Archive size={48} className="opacity-50" />
            <span className="font-mono text-sm font-bold tracking-widest uppercase">NO INCIDENTS ON RECORD</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-900/50 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
              <tr className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Threat Level</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Coordinates</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
              {incidents.map((incident) => {
                const level = incident.threatLevel || incident.severity || 'INFO';
                const colorClass = THREAT_COLORS[level] || THREAT_COLORS['INFO'];
                const isExpanded = expandedRow === incident._id;
                return (
                  <React.Fragment key={incident._id}>
                    <tr
                      onClick={() => toggleExpand(incident._id)}
                      className="group hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(incident.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${colorClass}`}>
                          <ShieldAlert size={12} /> {level}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-sans text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                        {incident.objectType || incident.threatType}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {incident.coordinates?.lat?.toFixed(5)}, {incident.coordinates?.lng?.toFixed(5)}
                      </td>
                      <td className="px-6 py-4">
                        {incident.acknowledged ? (
                          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-skywatch-emerald">
                            <CheckCircle2 size={14} /> ACKED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-500 animate-pulse">
                            <Crosshair size={14} /> PENDING
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-200 transition-colors">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>
                    {}
                    {isExpanded && (
                      <tr className="bg-slate-50 dark:bg-[#080d1a] border-b border-slate-200 dark:border-slate-800">
                        <td colSpan={6} className="p-0">
                          <div className="flex flex-col md:flex-row gap-6 p-6 animate-fade-in-up">
                            {}
                            <div className="flex-shrink-0 w-full md:w-1/2 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden relative shadow-lg">
                              <div className="absolute top-2 left-2 z-10 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-white font-mono text-[10px] uppercase font-bold tracking-widest">
                                <Video size={12} className="text-red-500 animate-pulse" />
                                REC {incident.droneId}
                              </div>
                              {incident.incidentMediaUrl ? (
                                incident.incidentMediaUrl.endsWith('.mp4') ? (
                                  <video
                                    src={`${BACKEND_URL}${incident.incidentMediaUrl}`}
                                    autoPlay
                                    loop
                                    muted
                                    controls
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={`${BACKEND_URL}${incident.incidentMediaUrl}`}
                                    alt="Incident Snapshot"
                                    className="w-full h-full object-cover"
                                  />
                                )
                              ) : (
                                <div className="w-full aspect-video flex flex-col gap-2 items-center justify-center text-slate-600">
                                  <Archive size={32} className="opacity-50" />
                                  <span className="font-mono text-xs font-bold uppercase tracking-widest">NO MEDIA AVAILABLE</span>
                                </div>
                              )}
                            </div>
                            {}
                            <div className="flex-1 flex flex-col justify-start">
                              <h3 className="text-lg font-bold font-sans text-white uppercase mb-4 border-b border-slate-800 pb-2">
                                Tactical SITREP Breakdown
                              </h3>
                              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                                <div>
                                  <div className="text-slate-500 mb-1">INCIDENT ID</div>
                                  <div className="text-slate-300 font-semibold">{incident._id}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 mb-1">DRONE ASSET</div>
                                  <div className="text-sky-400 font-semibold">{incident.droneId || 'UNKNOWN'}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 mb-1">CONFIDENCE</div>
                                  <div className="text-skywatch-emerald font-semibold">{(incident.confidence * 100).toFixed(1)}%</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 mb-1">SECTOR</div>
                                  <div className="text-slate-300 font-semibold">{incident.sector || 'N/A'}</div>
                                </div>
                              </div>
                              <div className="mt-6">
                                <div className="text-slate-500 font-mono text-xs mb-2">DETAILED DESCRIPTION</div>
                                <p className="text-sm font-sans text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded border border-slate-800">
                                  {incident.detailedDescription || `Detected ${incident.objectType} in ${incident.sector}. Visual confirmation pending. Potential geofence breach in progress.`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
