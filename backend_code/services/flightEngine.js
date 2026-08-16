const Drone = require('../models/Drone');
const { encryptPayload } = require('../utils/crypto');
const R = 6371e3;
function calculateDistance(lat1, lon1, lat2, lon2) {
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
function calculateBearing(lat1, lon1, lat2, lon2) {
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const λ1 = lon1 * Math.PI/180;
  const λ2 = lon2 * Math.PI/180;
  const y = Math.sin(λ2-λ1) * Math.cos(φ2);
  const x = Math.cos(φ1)*Math.sin(φ2) -
            Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
  const θ = Math.atan2(y, x);
  return (θ * 180/Math.PI + 360) % 360;
}
function moveTowards(lat, lng, targetLat, targetLng, distanceMeters) {
  const bearing = calculateBearing(lat, lng, targetLat, targetLng);
  const angularDist = distanceMeters / R;
  const φ1 = lat * Math.PI / 180;
  const λ1 = lng * Math.PI / 180;
  const brng = bearing * Math.PI / 180;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(angularDist) +
                       Math.cos(φ1) * Math.sin(angularDist) * Math.cos(brng));
  const λ2 = λ1 + Math.atan2(Math.sin(brng) * Math.sin(angularDist) * Math.cos(φ1),
                             Math.cos(angularDist) - Math.sin(φ1) * Math.sin(φ2));
  return {
    lat: φ2 * 180 / Math.PI,
    lng: λ2 * 180 / Math.PI,
    bearing: bearing
  };
}
let ioInstance = null;
function init(io) {
  ioInstance = io;
  setInterval(async () => {
    try {
      const drones = await Drone.find({});
      for (let drone of drones) {
        if (['PATROLLING', 'INTERCEPTING', 'RTH'].includes(drone.status) && drone.waypoints && drone.waypoints.length > 0) {
          if (drone.currentWaypointIndex >= drone.waypoints.length) {
            drone.currentWaypointIndex = 0;
          }
          const wp = drone.waypoints[drone.currentWaypointIndex];
          const dist = calculateDistance(drone.telemetry.location.lat, drone.telemetry.location.lng, wp.lat, wp.lng);
          const speed = drone.telemetry.speed || 12;
          const stepDist = speed * 1;
          if (dist <= 5) {
            drone.currentWaypointIndex = (drone.currentWaypointIndex + 1) % drone.waypoints.length;
          } else {
            const nextPos = moveTowards(drone.telemetry.location.lat, drone.telemetry.location.lng, wp.lat, wp.lng, Math.min(stepDist, dist));
            drone.telemetry.location.lat = nextPos.lat;
            drone.telemetry.location.lng = nextPos.lng;
            drone.telemetry.heading = nextPos.bearing;
          }
        }
        if (drone.status !== 'OFFLINE') {
          drone.telemetry.battery = Math.max(0, drone.telemetry.battery - 0.0005);
        }
        drone.updatedAt = Date.now();
        await drone.save();
        if (ioInstance) {
          const telemetryPayload = {
            droneId: drone.droneId,
            callsign: drone.callsign || 'UNKNOWN',
            timestamp: drone.updatedAt,
            status: drone.status,
            position: {
              latitude: drone.telemetry.location.lat,
              longitude: drone.telemetry.location.lng,
              altitudeMeters: drone.telemetry.altitude
            },
            metrics: {
              speedKmh: (drone.telemetry.speed || 12) * 3.6,
              batteryPercent: parseFloat(drone.telemetry.battery.toFixed(1)),
              headingDeg: parseFloat(drone.telemetry.heading.toFixed(1))
            }
          };
          const envelope = encryptPayload(telemetryPayload);
          ioInstance.emit('telemetry_update', envelope);
        }
      }
    } catch (err) {
      console.error('[FlightEngine] Loop Error:', err);
    }
  }, 1000);
  console.log('[FlightEngine] Autonomous Physics Simulator Started (1Hz)');
}
module.exports = { init };
