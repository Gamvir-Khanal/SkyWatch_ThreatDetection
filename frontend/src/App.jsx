import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { decryptPayload } from './utils/crypto';
import Navbar from './components/Navbar';
import OpticsFeed from './components/OpticsFeed';
import TacticalMap from './components/TacticalMap';
import ThreatLog from './components/ThreatLog';
import TelemetryStrip from './components/TelemetryStrip';
import AssetsView from './components/AssetsView';
import NetworkView from './components/NetworkView';
import LogsView from './components/LogsView';
import Blackbox from './components/Blackbox';
import Sidebar from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
const BACKEND_URL = 'http://localhost:8080';
function dispatchCipherEntry(event, envelope, data) {
  const preview = JSON.stringify(data).slice(0, 80) + (JSON.stringify(data).length > 80 ? '…' : '');
  window.dispatchEvent(new CustomEvent('cipher:entry', {
    detail: {
      event,
      iv:         envelope.iv,
      ciphertext: envelope.ciphertext,
      authTag:    envelope.authTag,
      preview,
    },
  }));
}
export default function App() {
  const [activeTab, setActiveTab] = useState('tactical');
  const [connected, setConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('skywatchSettings');
    return saved ? JSON.parse(saved) : {
      autoAck: false,
      audioAlarms: true,
      highContrast: false,
      dataSaver: false,
    };
  });
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('skywatchTheme');
    return saved || 'dark';
  });
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('skywatchTheme', theme);
  }, [theme]);
  const settingsRef = useRef(settings);
  const movingThreatRef = useRef({ lat: 28.6180, lng: 77.2000, heading: 45 });
  const [interceptVector, setInterceptVector] = useState(null);
  const [drones, setDrones] = useState([]);
  const [selectedDroneId, setSelectedDroneId] = useState('SKYW-KOL-01');
  const fetchDrones = () => {
    fetch(`${BACKEND_URL}/api/drones`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.drones) {
          setDrones(data.drones);
          if (data.drones.length > 0 && !data.drones.find(d => d.droneId === selectedDroneId)) {
            setSelectedDroneId('SKYW-KOL-01');
          }
        }
      })
      .catch(console.error);
  };
  useEffect(() => {
    fetchDrones();
    window.addEventListener('drone:registered', fetchDrones);
    return () => window.removeEventListener('drone:registered', fetchDrones);
  }, []);
  useEffect(() => {
    settingsRef.current = settings;
    localStorage.setItem('skywatchSettings', JSON.stringify(settings));
  }, [settings]);
  const [telemetry, setTelemetry] = useState({
    droneId: 'SKYW-KOL-01',
    callsign: 'KOLKATA WATCH',
    timestamp: new Date().toISOString(),
    status: 'ACTIVE_PATROL',
    flightMode: 'AUTONOMOUS_SURVEILLANCE',
    position: {
      latitude: 22.5726,
      longitude: 88.3639,
      altitudeMeters: 120.0,
    },
    metrics: {
      speedKmh: 45.2,
      headingDeg: 180.0,
      batteryPercent: 96.5,
      signalStrengthPercent: 98,
      satellitesLocked: 16,
    },
    sensors: {
      opticalStatus: 'NOMINAL',
      thermalStatus: 'ACTIVE',
      lidarRangeMeters: 450,
    },
  });
  const [alerts, setAlerts] = useState([
    {
      id: 'THREAT-DEMO-01',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      threatType: 'UNKNOWN_AERIAL_TARGET',
      confidence: 0.98,
      severity: 'CRITICAL',
      source: 'EDGE_AI_YOLOV8',
      coordinates: { lat: 28.6152, lng: 77.2115, altitude: 110 },
      acknowledged: false,
    },
    {
      id: 'THREAT-DEMO-02',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      threatType: 'GROUND_COMBAT_VEHICLE',
      confidence: 0.84,
      severity: 'WARNING',
      source: 'RADAR_ARRAY_03',
      coordinates: { lat: 28.6110, lng: 77.2140, altitude: 0 },
      acknowledged: false,
    },
  ]);
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/alerts/history?limit=15`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.incidents) {
          const formatted = data.incidents.map(inc => ({
            id: inc._id,
            timestamp: new Date(inc.timestamp).toLocaleTimeString(),
            threatType: inc.objectType || inc.threatType,
            confidence: inc.confidence,
            severity: inc.severity,
            source: inc.droneId,
            coordinates: inc.coordinates,
            acknowledged: inc.acknowledged,
            snapshotUrl: inc.snapshotUrl,
          }));
          setAlerts(formatted);
        }
      })
      .catch(err => console.error("Failed to load initial history:", err));
    fetch(`${BACKEND_URL}/api/drones`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.drones && data.drones.length > 0) {
          const firstDrone = data.drones.find(d => d.droneId === 'SKYW-KOL-01') || data.drones[0];
          setTelemetry(prev => ({
            ...prev,
            droneId: firstDrone.droneId,
            callsign: firstDrone.callsign || 'UNKNOWN',
            status: firstDrone.status,
            position: {
              latitude: firstDrone.telemetry?.location?.lat || prev.position.latitude,
              longitude: firstDrone.telemetry?.location?.lng || prev.position.longitude,
              altitudeMeters: firstDrone.telemetry?.altitude || prev.position.altitudeMeters,
            },
            metrics: {
              ...prev.metrics,
              speedKmh: (firstDrone.telemetry?.speed || 0) * 3.6,
              batteryPercent: firstDrone.telemetry?.battery || 100,
              headingDeg: firstDrone.telemetry?.heading || prev.metrics.headingDeg,
            }
          }));
        }
      })
      .catch(err => console.error("Failed to load drones:", err));
  }, []);
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      const threatTypes = ['UNKNOWN_AERIAL_TARGET', 'GEOFENCE_BREACH_PERSON', 'UNIDENTIFIED_VEHICLE', 'GROUND_COMBAT_VEHICLE'];
        const sources = ['EDGE_AI_YOLOV8', 'RADAR_ARRAY_03', 'LIDAR_SCANNER', 'ACOUSTIC_SENSOR'];
        const severityLevels = ['WARNING', 'CRITICAL', 'WARNING'];
        let baseLat = 22.5726;
        let baseLng = 88.3639;
        setTelemetry(t => {
          baseLat = t.position?.latitude || baseLat;
          baseLng = t.position?.longitude || baseLng;
          return t;
        });
        const newThreat = {
          id: `THREAT-SIM-${Date.now().toString().slice(-6)}`,
          timestamp: new Date().toLocaleTimeString(),
          threatType: threatTypes[Math.floor(Math.random() * threatTypes.length)],
          confidence: parseFloat((0.75 + Math.random() * 0.24).toFixed(3)),
          severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
          source: selectedDroneId,
          snapshotUrl: '/uploads/snapshots/default.jpg',
          coordinates: {
            lat: baseLat + (Math.random() - 0.5) * 0.015,
            lng: baseLng + (Math.random() - 0.5) * 0.015,
            altitude: Math.floor(Math.random() * 150)
          },
          acknowledged: false,
        };
        const mt = movingThreatRef.current;
        mt.lat = mt.lat === 28.6180 ? baseLat + 0.005 : mt.lat + 0.0002 * Math.cos(mt.heading * Math.PI / 180);
        mt.lng = mt.lng === 77.2000 ? baseLng - 0.005 : mt.lng + 0.0002 * Math.sin(mt.heading * Math.PI / 180);
        mt.heading += (Math.random() - 0.5) * 5;
        const movingThreat = {
          id: 'THREAT-MOVING-01',
          timestamp: new Date().toLocaleTimeString(),
          threatType: 'FAST_MOVER_HOSTILE',
          confidence: 0.99,
          severity: 'CRITICAL',
          source: selectedDroneId,
          snapshotUrl: '/uploads/snapshots/default.jpg',
          coordinates: { lat: mt.lat, lng: mt.lng, altitude: 200 },
          acknowledged: false,
        };
        fetch(`${BACKEND_URL}/api/alerts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newThreat) }).catch(()=>{});
        fetch(`${BACKEND_URL}/api/alerts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(movingThreat) }).catch(()=>{});
        if (settingsRef.current.audioAlarms && newThreat.severity === 'CRITICAL') {
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          } catch (e) {}
        }
    }, 4500);
    return () => clearInterval(interval);
  }, [isSimulating]);
  useEffect(() => {
    console.log(`Connecting to SkyWatch Command Gateway at ${BACKEND_URL}...`);
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
    });
    socket.on('connect', () => {
      console.log('✅ Connected to SkyWatch Socket.IO Gateway');
      setConnected(true);
    });
    socket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from SkyWatch Socket.IO Gateway');
      setConnected(false);
    });
    socket.on('connection_ack', async (envelope) => {
      const data = await decryptPayload(envelope);
      if (data) {
        console.log('🔐 SkyWatch Gateway ACK (decrypted):', data);
        dispatchCipherEntry('connection_ack', envelope, data);
      }
    });
    socket.on('telemetry_update', async (envelope) => {
      const data = await decryptPayload(envelope);
      if (data) {
        if (settingsRef.current.dataSaver && Math.random() < 0.8) return;
        if (data.droneId === selectedDroneId) {
          setTelemetry(data);
        }
        if (Math.random() < 0.2) dispatchCipherEntry('telemetry_update', envelope, data);
      }
    });
    socket.on('new_threat', async (envelope) => {
      const data = await decryptPayload(envelope);
      if (!data) return;
      const currentSettings = settingsRef.current;
      if (currentSettings.audioAlarms && (data.severity === 'CRITICAL' || data.severity === 'WARNING')) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.type = data.severity === 'CRITICAL' ? 'square' : 'triangle';
          osc.frequency.setValueAtTime(data.severity === 'CRITICAL' ? 880 : 440, ctx.currentTime);
          osc.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}
      }
      console.log('🚨 New Threat Ingested (decrypted):', data);
      dispatchCipherEntry('new_threat', envelope, data);
      const isWarning = (data.severity || 'CRITICAL') === 'WARNING';
      const shouldAutoAck = currentSettings.autoAck && isWarning;
      const newAlert = {
        id: data.id || `THREAT-${Date.now()}`,
        timestamp: new Date(data.timestamp || Date.now()).toLocaleTimeString(),
        threatType: data.threatType || data.type || 'UNIDENTIFIED_TARGET',
        confidence: data.confidence !== undefined ? data.confidence : 0.95,
        severity: data.severity || 'CRITICAL',
        source: data.source || 'EDGE_AI_YOLO',
        coordinates: data.coordinates,
        acknowledged: shouldAutoAck,
      };
      setAlerts((prev) => {
        const existing = prev.findIndex(a => a.id === newAlert.id);
        let updated;
        if (existing !== -1) {
          updated = [...prev];
          updated[existing] = newAlert;
        } else {
          updated = [newAlert, ...prev];
        }
        return updated.slice(0, 4);
      });
    });
    socket.on('intercept_calculated', async (envelope) => {
      const data = await decryptPayload(envelope);
      if (data) {
        console.log('🎯 Intercept vector received:', data);
        setInterceptVector(data);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [selectedDroneId]);
  const handleAcknowledge = (id) => {
    fetch(`${BACKEND_URL}/api/alerts/${id}/acknowledge`, { method: 'PATCH' }).catch(()=>{});
    setAlerts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, acknowledged: true } : item))
    );
  };
  const unackCount = alerts.filter((a) => !a.acknowledged).length;
  return (
    <>
      {}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020408]">
        {}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#071118] via-[#020408] to-[#010204]"></div>
        {}
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
        {}
        <div className="absolute inset-0 opacity-20 starry-radar-bg" style={{ animationDuration: '60s' }}></div>
      </div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <div className="flex h-screen w-full overflow-hidden bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300 relative z-10">
            {}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1 flex flex-col min-w-0">
            {}
        <Navbar
          connected={connected}
          unackCount={unackCount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alerts={alerts}
          settings={settings}
          setSettings={setSettings}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
          theme={theme}
          setTheme={setTheme}
          drones={drones}
          selectedDroneId={selectedDroneId}
          setSelectedDroneId={setSelectedDroneId}
        />
        {}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-2 gap-2">
          {}
          {activeTab === 'tactical' && (
            <div className="flex-1 min-h-0 flex gap-2">
              {}
              <div
                className="flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                style={{ flex: '4 1 0', minWidth: '280px' }}
              >
                <OpticsFeed telemetry={telemetry} />
              </div>
              {}
              <div
                className="flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden z-0"
                style={{ flex: '4 1 0', minWidth: '260px' }}
              >
                <TacticalMap telemetry={telemetry} alerts={alerts} settings={settings} interceptVector={interceptVector} />
              </div>
              {}
              <div
                className="flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                style={{ flex: '5 1 0', minWidth: '260px' }}
              >
                <ThreatLog alerts={alerts} onAcknowledge={handleAcknowledge} />
              </div>
            </div>
          )}
          {activeTab === 'assets' && (
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <AssetsView telemetry={telemetry} />
            </div>
          )}
          {activeTab === 'network' && (
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <NetworkView connected={connected} />
            </div>
          )}
          {activeTab === 'logs' && (
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <LogsView alerts={alerts} />
            </div>
          )}
          {activeTab === 'evidence' && (
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <Blackbox />
            </div>
          )}
          {}
          <div className="shrink-0">
            <TelemetryStrip telemetry={telemetry} />
          </div>
        </div>
      </div>
    </div>
      } />
    </Routes>
    </>
  );
}
