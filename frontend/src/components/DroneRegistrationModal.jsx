import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, PlusCircle, CheckCircle } from 'lucide-react';
export default function DroneRegistrationModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ callsign: '', sector: '', streamUrl: '' });
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let lat = undefined;
      let lng = undefined;
      if (formData.sector) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.sector)}`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          }
        } catch (geoErr) {
          console.error("Geocoding failed", geoErr);
        }
      }
      const payload = { ...formData };
      if (lat !== undefined && lng !== undefined) {
        payload.telemetry = { location: { lat, lng } };
      }
      const res = await fetch('http://localhost:8080/api/drones/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setCredentials(data);
      } else {
        setError(data.error || 'Failed to register drone.');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleCopy = () => {
    if (credentials) {
      navigator.clipboard.writeText(`DRONE_ID="${credentials.droneId}"\nDRONE_API_KEY="${credentials.apiKey}"`);
      alert('Credentials copied to clipboard!');
    }
  };
  const handleClose = () => {
    if (credentials) {
      window.dispatchEvent(new CustomEvent('drone:registered'));
    }
    onClose();
  };
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl w-full max-w-md m-auto shadow-2xl flex flex-col font-mono">
        <div className="flex justify-between items-center px-5 py-3 border-b-2 border-slate-700 bg-slate-950">
          <h2 className="text-emerald-500 font-bold tracking-widest text-sm flex items-center gap-2 uppercase">
            <PlusCircle size={16} />
            Register Fleet Asset
          </h2>
          <button onClick={handleClose} className="text-slate-500 hover:text-red-500 transition-colors p-1">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 bg-slate-900 text-slate-300">
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-500/50 text-red-400 text-xs p-3 rounded flex items-start gap-2 uppercase tracking-wide">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          {!credentials ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5">Callsign</label>
                <input
                  type="text"
                  required
                  placeholder="E.G. PHANTOM RECON 4"
                  className="w-full bg-slate-950 border border-slate-700 text-emerald-400 text-xs p-2.5 rounded focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-700 uppercase"
                  value={formData.callsign}
                  onChange={e => setFormData({...formData, callsign: e.target.value.toUpperCase()})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5">Deployment Address / Sector</label>
                <input
                  type="text"
                  placeholder="E.G. 1600 PENNSYLVANIA AVE OR SECTOR 7G"
                  className="w-full bg-slate-950 border border-slate-700 text-emerald-400 text-xs p-2.5 rounded focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-700 uppercase"
                  value={formData.sector}
                  onChange={e => setFormData({...formData, sector: e.target.value.toUpperCase()})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5">Stream URL (RTSP / LOCAL)</label>
                <input
                  type="text"
                  placeholder="E.G. DRONE_FEED.MP4"
                  className="w-full bg-slate-950 border border-slate-700 text-emerald-400 text-xs p-2.5 rounded focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-700 mb-2"
                  value={formData.streamUrl}
                  onChange={e => setFormData({...formData, streamUrl: e.target.value})}
                />
                <div className="bg-slate-950/50 border border-slate-800 rounded p-2">
                  <div className="text-[9px] text-slate-500 font-bold tracking-widest mb-2 uppercase">Suggested Feeds (Click to Use):</div>
                  <ul className="space-y-1">
                    {[
                      'https://cdn.pixabay.com/video/2021/08/04/83864-584742683_large.mp4',
                      'https://cdn.pixabay.com/video/2022/10/24/136274-764669864_large.mp4',
                      'https://cdn.pixabay.com/video/2019/11/11/28956-373295843_large.mp4',
                      'https://cdn.pixabay.com/video/2020/05/25/40130-425022138_large.mp4',
                      'https://cdn.pixabay.com/video/2020/07/22/45375-442848972_large.mp4'
                    ].map((url, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, streamUrl: url})}
                          className="text-[9px] text-emerald-600 hover:text-emerald-400 text-left w-full truncate transition-colors"
                          title={url}
                        >
                          [+] {url}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500 text-emerald-500 font-bold text-xs py-3 rounded tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'INITIALIZING...' : 'GENERATE KEYS'}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <CheckCircle className="text-emerald-500" size={24} />
                </div>
              </div>
              <h3 className="text-center font-bold text-emerald-400 tracking-widest text-sm mb-2 uppercase">Asset Registered</h3>
              <div className="bg-slate-950 border border-slate-700 p-4 rounded">
                <div className="text-[10px] text-slate-500 uppercase mb-1 tracking-widest font-bold">Assigned Drone ID</div>
                <div className="text-emerald-400 text-sm font-bold tracking-wider">{credentials.droneId}</div>
              </div>
              <div className="bg-slate-950 border border-slate-700 p-4 rounded">
                <div className="text-[10px] text-slate-500 uppercase mb-1 tracking-widest font-bold flex justify-between">
                  <span>API Key</span>
                  <span className="text-red-500 animate-pulse">KEEP SECURE</span>
                </div>
                <div className="text-emerald-400 text-xs font-bold break-all">
                  {credentials.apiKey}
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="mt-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs py-3 rounded tracking-widest uppercase transition-all flex items-center justify-center gap-2"
              >
                <Copy size={14} />
                Copy Configuration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
