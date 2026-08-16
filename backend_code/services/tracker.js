class Tracker {
  constructor() {
    this.tracks = new Map();
  }
  updateTrack(trackId, lat, lng, timestamp) {
    if (!this.tracks.has(trackId)) {
      this.tracks.set(trackId, []);
    }
    const history = this.tracks.get(trackId);
    const ts = timestamp ? new Date(timestamp).getTime() : Date.now();
    history.push({ lat, lng, timestamp: ts });
    if (history.length > 10) {
      history.shift();
    }
  }
  calculateVector(trackId, droneCoords, droneSpeedKmh) {
    const history = this.tracks.get(trackId);
    if (!history || history.length < 2) return null;
    const p1 = history[history.length - 2];
    const p2 = history[history.length - 1];
    const deltaTSeconds = (p2.timestamp - p1.timestamp) / 1000;
    if (deltaTSeconds <= 0) return null;
    const deltaLat = p2.lat - p1.lat;
    const deltaLng = p2.lng - p1.lng;
    const vx = deltaLng / deltaTSeconds;
    const vy = deltaLat / deltaTSeconds;
    const KM_PER_LAT_DEG = 111.32;
    const KM_PER_LNG_DEG = 111.32 * Math.cos(p2.lat * (Math.PI / 180));
    const distanceKm = Math.sqrt(
      Math.pow(deltaLat * KM_PER_LAT_DEG, 2) +
      Math.pow(deltaLng * KM_PER_LNG_DEG, 2)
    );
    const speedKmh = (distanceKm / deltaTSeconds) * 3600;
    let bearing = Math.atan2(deltaLng * KM_PER_LNG_DEG, deltaLat * KM_PER_LAT_DEG) * (180 / Math.PI);
    if (bearing < 0) bearing += 360;
    const latPred30 = p2.lat + (vy * 30);
    const lngPred30 = p2.lng + (vx * 30);
    const latPred60 = p2.lat + (vy * 60);
    const lngPred60 = p2.lng + (vx * 60);
    const droneSpeedKs = droneSpeedKmh / 3600;
    const vxKm = vx * KM_PER_LNG_DEG;
    const vyKm = vy * KM_PER_LAT_DEG;
    const dx = (p2.lng - droneCoords.lng) * KM_PER_LNG_DEG;
    const dy = (p2.lat - droneCoords.lat) * KM_PER_LAT_DEG;
    const A = Math.pow(vxKm, 2) + Math.pow(vyKm, 2) - Math.pow(droneSpeedKs, 2);
    const B = 2 * (dx * vxKm + dy * vyKm);
    const C = Math.pow(dx, 2) + Math.pow(dy, 2);
    const discriminant = B * B - 4 * A * C;
    let tIntercept = -1;
    let interceptPoint = null;
    if (discriminant >= 0) {
      const t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
      const t2 = (-B - Math.sqrt(discriminant)) / (2 * A);
      if (t1 > 0 && (t2 <= 0 || t1 < t2)) {
        tIntercept = t1;
      } else if (t2 > 0) {
        tIntercept = t2;
      }
    }
    if (tIntercept > 0 && tIntercept < 3600) {
      interceptPoint = {
        lat: +(p2.lat + (vy * tIntercept)).toFixed(6),
        lng: +(p2.lng + (vx * tIntercept)).toFixed(6)
      };
    } else {
      tIntercept = null;
    }
    return {
      trackId,
      currentSpeedKmh: +speedKmh.toFixed(1),
      headingDeg: +bearing.toFixed(1),
      predictions: {
        t30: { lat: +latPred30.toFixed(6), lng: +lngPred30.toFixed(6) },
        t60: { lat: +latPred60.toFixed(6), lng: +lngPred60.toFixed(6) }
      },
      intercept: interceptPoint ? {
        timeToInterceptSec: +tIntercept.toFixed(1),
        point: interceptPoint
      } : null
    };
  }
}
module.exports = new Tracker();
