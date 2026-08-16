import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Crosshair, Hexagon } from 'lucide-react';
function MapUpdater({ droneId, center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, { animate: true, duration: 1.2 });
    }
  }, [droneId, map]);
  return null;
}
function DroneLocator() {
  const map = useMap();
  useEffect(() => {
    function onLocate(e) {
      if (e.detail?.lat && e.detail?.lng) {
        map.flyTo([e.detail.lat, e.detail.lng], 16, { animate: true, duration: 1 });
      }
    }
    window.addEventListener('c2:locate_drone', onLocate);
    return () => window.removeEventListener('c2:locate_drone', onLocate);
  }, [map]);
  return null;
}
function C2TrackListener() {
  const map = useMap();
  useEffect(() => {
    function onTrack(e) {
      const { coordinates } = e.detail || {};
      if (coordinates?.lat && coordinates?.lng) {
        map.flyTo([coordinates.lat, coordinates.lng], 16, { animate: true, duration: 1.2 });
      }
    }
    window.addEventListener('c2:track', onTrack);
    return () => window.removeEventListener('c2:track', onTrack);
  }, [map]);
  return null;
}
function MapModeListener({ mapMode, setDraftWaypoints, setDraftGeofence }) {
  useMapEvents({
    click(e) {
      if (mapMode === 'DRAW_PATROL') {
        setDraftWaypoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
      } else if (mapMode === 'EDIT_GEOFENCE') {
        setDraftGeofence(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
      }
    }
  });
  return null;
}
export default function TacticalMap({ telemetry, alerts, settings, interceptVector }) {
  const lat = telemetry?.position?.latitude || 22.5726;
  const lng = telemetry?.position?.longitude || 88.3639;
  const heading = telemetry?.metrics?.headingDeg || 0;
  const [mapMode, setMapMode] = useState('VIEW');
  const [draftWaypoints, setDraftWaypoints] = useState([]);
  const [draftGeofence, setDraftGeofence] = useState([]);
  const [dbGeofences, setDbGeofences] = useState([]);
  useEffect(() => {
    fetch('http://localhost:8080/api/geofence')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDbGeofences(data.geofences);
        }
      }).catch(err => console.error("Geofence load error:", err));
  }, []);
  const handleSaveWaypoints = () => {
    if (draftWaypoints.length === 0) return;
    const formatted = draftWaypoints.map((wp, i) => ({ lat: wp[0], lng: wp[1], altitude: 50, order: i }));
    fetch(`http://localhost:8080/api/drones/${telemetry?.droneId || 'DRONE-01'}/waypoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatted)
    }).then(() => {
      setMapMode('VIEW');
      setDraftWaypoints([]);
    }).catch(console.error);
  };
  const handleSaveGeofence = () => {
    if (draftGeofence.length < 3) return;
    const formatted = draftGeofence.map(wp => ({ lat: wp[0], lng: wp[1] }));
    fetch(`http://localhost:8080/api/geofence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectorName: 'Custom Sector', polygon: formatted, threatLevel: 'RESTRICTED' })
    }).then(() => {
      setMapMode('VIEW');
      setDraftGeofence([]);
      return fetch('http://localhost:8080/api/geofence');
    }).then(res => res.json()).then(data => {
        if (data && data.success) setDbGeofences(data.geofences);
    }).catch(console.error);
  };
  const [trail, setTrail] = useState([]);
  useEffect(() => {
    if (lat && lng) {
      setTrail(prev => [...prev.slice(-30), [lat, lng]]);
    }
  }, [lat, lng]);
  const droneIcon = useMemo(() => {
    return L.divIcon({
      className: 'tactical-drone-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(16, 185, 129, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="transform: rotate(${heading}deg); transition: transform 0.5s ease; color: #10b981; background: #020617; border: 2px solid #10b981; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(16,185,129,0.5);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
          <div style="position: absolute; top: 32px; font-size: 10px; font-weight: 700; background: rgba(2,6,23,0.8); color: #10b981; border: 1px solid rgba(16,185,129,0.5); border-radius: 4px; padding: 2px 6px; white-space: nowrap; backdrop-filter: blur(4px);">
            ${telemetry?.droneId || 'DRONE-01'}
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }, [heading, telemetry?.droneId]);
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {}
      <div className="flex justify-between items-center px-3 py-2 shrink-0 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-[11px] font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase flex items-center gap-1.5">
          <MapIcon size={13} className="text-emerald-500" />
          Tactical Sector Map
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('c2:locate_drone', { detail: { lat, lng } }))}
            className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase transition-colors"
          >
            <Crosshair size={10} />
            Locate Drone
          </button>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-semibold">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </div>
        </div>
      </div>
      <div className="relative flex-1 min-h-0 bg-slate-900 overflow-hidden border-t-0 z-0">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={
              settings?.highContrast
                ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            }
          />
          {mapMode === 'VIEW' && <MapUpdater droneId={telemetry?.droneId} center={[lat, lng]} />}
          <C2TrackListener />
          <DroneLocator />
          <MapModeListener mapMode={mapMode} setDraftWaypoints={setDraftWaypoints} setDraftGeofence={setDraftGeofence} />
          {}
          {dbGeofences.map(gf => (
            <Polygon
              key={gf._id}
              positions={gf.polygon.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: gf.threatLevel === 'CRITICAL' ? '#ef4444' : '#10b981',
                weight: 2,
                dashArray: '8, 8',
                fillColor: gf.threatLevel === 'CRITICAL' ? '#ef4444' : '#10b981',
                fillOpacity: gf.threatLevel === 'CRITICAL' ? 0.2 : 0.1,
              }}
            >
              <Tooltip direction="center" opacity={1} permanent className="bg-transparent border-none text-red-500 font-bold text-xs shadow-none">
                {gf.sectorName}
              </Tooltip>
            </Polygon>
          ))}
          {}
          {draftWaypoints.length > 0 && (
            <Polyline positions={draftWaypoints} pathOptions={{ color: '#0ea5e9', weight: 3, dashArray: '6, 8' }} />
          )}
          {draftWaypoints.map((wp, i) => (
            <Marker key={i} position={wp} icon={L.divIcon({ className: 'bg-sky-500 w-3 h-3 rounded-full border-2 border-white shadow-[0_0_10px_rgba(14,165,233,0.8)]' })} />
          ))}
          {}
          {draftGeofence.length > 0 && (
            <Polygon positions={draftGeofence} pathOptions={{ color: '#f59e0b', weight: 2, dashArray: '5, 5', fillColor: '#f59e0b', fillOpacity: 0.2 }} />
          )}
          {}
          {trail.length > 1 && (
            <Polyline
              positions={trail}
              pathOptions={{ color: '#10b981', weight: 3, opacity: 0.5 }}
            />
          )}
          {}
          <Marker position={[lat, lng]} icon={droneIcon}>
            <Popup>
              <div className="p-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">{telemetry?.droneId}</div>
                <div>Alt: {telemetry?.position?.altitudeMeters}m</div>
                <div>Spd: {telemetry?.metrics?.speedKmh} km/h</div>
                <div>Status: {telemetry?.status}</div>
              </div>
            </Popup>
          </Marker>
          {}
          {alerts && alerts.slice(0, 5).map((threat, idx) => {
            const tLat = threat.coordinates?.lat || (28.6145 + idx * 0.001);
            const tLng = threat.coordinates?.lng || (77.2095 + idx * 0.001);
            const isCrit = threat.severity === 'CRITICAL';
            const color = isCrit ? '#ef4444' : '#f59e0b';
            const threatIcon = L.divIcon({
              className: 'tactical-threat-marker',
              html: `
                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
                  <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid ${color}; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                  <div style="color: #fff; background: ${color}; border: 2px solid white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; box-shadow: 0 0 12px ${color};">
                    !
                  </div>
                </div>
              `,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            });
            return (
              <Marker key={threat.id || idx} position={[tLat, tLng]} icon={threatIcon}>
                <Popup>
                  <div className="p-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                    <div className={`${isCrit ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'} font-bold text-sm mb-1`}>{threat.threatType}</div>
                    <div>Severity: {threat.severity}</div>
                    <div>Conf: {(threat.confidence * 100).toFixed(0)}%</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {}
          {interceptVector?.intercept?.point && (
            <>
              <Polyline
                positions={[
                  [lat, lng],
                  [interceptVector.intercept.point.lat, interceptVector.intercept.point.lng]
                ]}
                pathOptions={{ color: '#0ea5e9', weight: 2, opacity: 0.8, dashArray: '6, 8' }}
              />
              <Marker position={[interceptVector.intercept.point.lat, interceptVector.intercept.point.lng]} icon={L.divIcon({
                  className: 'intercept-marker',
                  html: `
                    <div style="background: rgba(14, 165, 233, 0.2); border: 2px solid #0ea5e9; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(14,165,233,0.6);">
                      <div style="width: 8px; height: 8px; background: #0ea5e9; border-radius: 50%;"></div>
                    </div>
                    <div style="position: absolute; top: 28px; left: -14px; font-size: 10px; font-weight: bold; color: #0ea5e9; white-space: nowrap; background: rgba(2,6,23,0.8); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(14,165,233,0.3); backdrop-filter: blur(4px);">
                      ETA: ${interceptVector.intercept.timeToInterceptSec}s
                    </div>
                  `,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })}>
              </Marker>
            </>
          )}
        </MapContainer>
        {}
        <div className="absolute top-2 left-2 z-[400] bg-slate-900/80 backdrop-blur-md border border-slate-700 px-2 py-1 rounded-md text-[9px] font-mono font-bold text-slate-300 pointer-events-none">
          {mapMode !== 'VIEW' ? `MODE: ${mapMode}` : 'GRID: SECTOR-7B | GEO: ACTIVE'}
        </div>
        {}
        <div className="absolute top-2 right-2 z-[400] flex flex-col gap-1">
          <button
            onClick={() => { setMapMode(mapMode === 'DRAW_PATROL' ? 'VIEW' : 'DRAW_PATROL'); setDraftWaypoints([]); }}
            className={`flex items-center gap-1 text-[9px] px-2 py-1 font-bold tracking-wider rounded-md border transition-all shadow-sm ${mapMode === 'DRAW_PATROL' ? 'bg-sky-500 text-white border-sky-400' : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'}`}
          >
            <Hexagon size={11} /> PATROL
          </button>
          <button
            onClick={() => { setMapMode(mapMode === 'EDIT_GEOFENCE' ? 'VIEW' : 'EDIT_GEOFENCE'); setDraftGeofence([]); }}
            className={`flex items-center gap-1 text-[9px] px-2 py-1 font-bold tracking-wider rounded-md border transition-all shadow-sm ${mapMode === 'EDIT_GEOFENCE' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'}`}
          >
            <Crosshair size={11} /> GEOFENCE
          </button>
        </div>
        {}
        {mapMode === 'DRAW_PATROL' && draftWaypoints.length > 0 && (
          <button
            onClick={handleSaveWaypoints}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg transition-colors"
          >
            SAVE PATROL ROUTE
          </button>
        )}
        {mapMode === 'EDIT_GEOFENCE' && draftGeofence.length > 2 && (
          <button
            onClick={handleSaveGeofence}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg transition-colors"
          >
            SAVE GEOFENCE
          </button>
        )}
      </div>
    </div>
  );
}
