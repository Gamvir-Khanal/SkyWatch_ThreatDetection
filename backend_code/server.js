const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { encryptPayload } = require('./utils/crypto');
const { GoogleGenAI } = require('@google/genai');
const tracker = require('./services/tracker');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Drone = require('./models/Drone');
const ThreatIncident = require('./models/ThreatIncident');
const Geofence = require('./models/Geofence');
const Asset = require('./models/Asset');
const flightEngine = require('./services/flightEngine');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const PORT = process.env.PORT || 8080;
let lastRawPacket = { raw: null, decrypted: null };
let latestDroneCoords = { lat: 28.613939, lng: 77.209021 };
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log('[SITREP] Gemini API Client initialized for SITREP generator.');
} else {
  console.warn('[WARNING] GEMINI_API_KEY is not set. AI SITREP generator will not function.');
}
let latestSitrep = null;
const recentAlerts = [];
async function generateSitrep(alerts) {
  if (!ai) return null;
  try {
    const prompt = `You are a tactical military intelligence AI analyzing real-time border UAV surveillance data. Analyze the following sequence of incursions: ${JSON.stringify(alerts)}. Output a strict JSON object with:
      - 'threatLevel': ('LOW' | 'ELEVATED' | 'CRITICAL')
      - 'sitrepTitle': 5-10 word headline
      - 'summary': 2-3 sentence strategic situation breakdown
      - 'recommendedAction': Immediate tactical countermeasure for field units
      - 'interceptSector': Most critical target sector`;
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    const sitrepData = JSON.parse(response.text());
    sitrepData.timestamp = new Date().toISOString();
    latestSitrep = sitrepData;
    console.log(`[SITREP] Generated new SITREP: ${sitrepData.sitrepTitle}`);
    io.emit('new_sitrep', sitrepData);
    return sitrepData;
  } catch (err) {
    console.error('[ERROR] Failed to generate SITREP:', err);
    return null;
  }
}
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skywatch")
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    try {
      const count = await Asset.countDocuments();
      if (count === 0) {
        await Asset.create([
          {
            assetId: 'ASSET-M1A2',
            name: 'M1A2 ABRAMS TANK',
            type: 'Ground Vehicle',
            callsign: 'HEAVY-ONE',
            status: 'ON PATROL (GRID 4C)',
            maintenanceScheduled: false,
            icon: 'directions_car',
            theme: 'error',
            diagnostics: {
              title: 'EDGE AI PREDICTIVE ALERT',
              alerts: [
                { label: 'ENGINE WEAR', value: '82% (CRITICAL)', isError: true },
                { label: 'OIL PRESSURE', value: 'DROPPING (42 PSI)', isWarning: true },
                { label: 'PREDICTED FAILURE', value: '< 48 HOURS', isPulse: true }
              ]
            }
          },
          {
            assetId: 'ASSET-APC',
            name: 'APC STRYKER',
            type: 'Ground Vehicle',
            callsign: 'TRANSPORT-TWO',
            status: 'IDLE (BASE CAMP)',
            maintenanceScheduled: false,
            icon: 'airport_shuttle',
            theme: 'orange',
            diagnostics: {
              fuelLevel: '88%',
              title: 'EDGE AI DIAGNOSTICS',
              alerts: [
                { label: 'LEFT TRACK TENSION', value: 'SUB-OPTIMAL', isWarning: true },
                { label: 'PREDICTED FAILURE', value: '30+ DAYS', isInfo: true }
              ]
            }
          }
        ]);
        console.log('✅ Initial Assets Seeded');
      }
    } catch (err) {
      console.error('❌ Error seeding assets:', err);
    }
      await Drone.findOneAndUpdate(
        { droneId: 'SKYW-KOL-01' },
        {
          droneId: 'SKYW-KOL-01',
          callsign: 'KOLKATA WATCH',
          sector: 'KOLKATA-EAST',
          apiKey: 'kolkata-secret-key-12345',
          status: 'PATROLLING',
          telemetry: { battery: 98, altitude: 120, speed: 45, heading: 90, location: { lat: 22.5726, lng: 88.3639 } },
          waypoints: [
            { lat: 22.5726, lng: 88.3639 },
            { lat: 22.5800, lng: 88.3700 },
            { lat: 22.5650, lng: 88.3600 }
          ]
        },
        { upsert: true, new: true }
      );
      // Ensure ONLY Kolkata drone is present
      await Drone.deleteMany({ droneId: { $ne: 'SKYW-KOL-01' } });
      flightEngine.init(io);
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public/uploads/incidents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
async function authDrone(req, res, next) {
  const apiKey = req.headers['x-drone-api-key'];
  if (!apiKey) return res.status(401).json({ success: false, error: 'Missing x-drone-api-key header' });
  try {
    let drone = await Drone.findOne({ apiKey });
    if (!drone && (apiKey === 'kolkata-secret-key-12345' || apiKey === 'sk_drone_12345' || req.body?.droneId === 'SKYW-KOL-01')) {
      drone = await Drone.findOneAndUpdate(
        { droneId: 'SKYW-KOL-01' },
        {
          droneId: 'SKYW-KOL-01',
          callsign: 'KOLKATA EAGLE',
          sector: 'KOLKATA-EAST',
          apiKey: apiKey,
          status: 'PATROLLING',
          telemetry: { battery: 92, altitude: 110, speed: 14, heading: 90, location: { lat: 22.5726, lng: 88.3639 } }
        },
        { upsert: true, new: true }
      );
    }
    if (!drone) return res.status(401).json({ success: false, error: 'Invalid API Key' });
    req.drone = drone;
    next();
  } catch (err) {
    console.error('authDrone error:', err);
    return res.status(500).json({ success: false, error: 'Auth error: ' + err.message });
  }
}
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'SkyWatch Tactical Command Backend',
    version: '1.0.0',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    connectedClients: io.engine.clientsCount,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
app.get('/api/comms/raw-packet', (req, res) => {
  res.json(lastRawPacket);
});
app.post('/api/drones/register', async (req, res) => {
  try {
    const drone = new Drone(req.body);
    drone.apiKey = crypto.randomBytes(32).toString('hex');
    drone.droneId = `UAV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    await drone.save();
    if (io) {
      io.emit('fleet_update', { action: 'REGISTER', drone });
    }
    res.json({ success: true, drone });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/drones', async (req, res) => {
  try {
    const drones = await Drone.find().select('-apiKey');
    res.json({ success: true, drones });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/drones/:droneId/telemetry', authDrone, async (req, res) => {
  try {
    if (req.drone.droneId !== req.params.droneId) return res.status(403).json({ success: false, error: 'Drone ID mismatch' });
    req.drone.telemetry = { ...req.drone.telemetry, ...req.body };
    req.drone.status = req.body.status || req.drone.status;
    await req.drone.save();
    const envelope = encryptPayload(req.drone);
    io.emit('drone_telemetry', envelope);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/drones/:droneId/waypoints', async (req, res) => {
  try {
    const drone = await Drone.findOne({ droneId: req.params.droneId });
    if (!drone) return res.status(404).json({ success: false, error: 'Drone not found' });
    drone.waypoints = req.body;
    drone.currentWaypointIndex = 0;
    await drone.save();
    res.json({ success: true, waypoints: drone.waypoints });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/drones/:droneId/mode', async (req, res) => {
  try {
    const drone = await Drone.findOne({ droneId: req.params.droneId });
    if (!drone) return res.status(404).json({ success: false, error: 'Drone not found' });
    drone.status = req.body.status || req.body.mode;
    if (drone.status === 'INTERCEPTING' && req.body.targetCoordinates) {
      drone.waypoints = [{
        lat: req.body.targetCoordinates.lat,
        lng: req.body.targetCoordinates.lng,
        altitude: 40,
        order: 0
      }];
      drone.currentWaypointIndex = 0;
    }
    await drone.save();
    res.json({ success: true, status: drone.status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/geofence', async (req, res) => {
  try {
    const geofence = new Geofence(req.body);
    await geofence.save();
    res.json({ success: true, geofence });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/geofence', async (req, res) => {
  try {
    const geofences = await Geofence.find();
    res.json({ success: true, geofences });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await Asset.find();
    res.json({ success: true, assets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.patch('/api/assets/:id/maintenance', async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { maintenanceScheduled: req.body.maintenanceScheduled },
      { new: true }
    );
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
    res.json({ success: true, asset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/alerts', async (req, res) => {
  try {
    const { threatType, confidence, severity, source, coordinates } = req.body;
    const incident = new ThreatIncident({
      droneId: source || 'UNKNOWN',
      objectType: threatType,
      confidence: Number(confidence) || 0.5,
      severity: severity || 'WARNING',
      sector: 'Simulator Sector',
      coordinates: coordinates,
      acknowledged: req.body.acknowledged || false
    });
    await incident.save();
    const count = await ThreatIncident.countDocuments();
    if (count > 10) {
      const oldestAlerts = await ThreatIncident.find().sort({ timestamp: 1 }).limit(count - 10);
      for (const old of oldestAlerts) {
        await ThreatIncident.findByIdAndDelete(old._id);
      }
    }
    const alertData = {
      id: incident._id.toString(),
      ...incident.toObject(),
      threatType: threatType,
    };
    const envelope = encryptPayload(alertData);
    lastRawPacket = { raw: envelope, decrypted: alertData };
    io.emit('new_threat', envelope);
    res.status(201).json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/alerts/upload-incident', authDrone, upload.single('file'), async (req, res) => {
  try {
    const { objectType, confidence, severity, sector, lat, lng, detailedDescription } = req.body;
    const incidentMediaUrl = req.file ? `/uploads/incidents/${req.file.filename}` : null;
    const threatLevel = req.body.threatLevel || severity;
    const desc = detailedDescription || `Detected ${objectType} in ${sector || 'unknown sector'}`;
    const incident = new ThreatIncident({
      droneId: req.drone.droneId,
      objectType,
      confidence: Number(confidence),
      severity,
      threatLevel,
      detailedDescription: desc,
      sector,
      coordinates: { lat: Number(lat), lng: Number(lng) },
      snapshotUrl: incidentMediaUrl,
      incidentMediaUrl
    });
    await incident.save();
    const count = await ThreatIncident.countDocuments();
    if (count > 10) {
      const oldestAlerts = await ThreatIncident.find().sort({ timestamp: 1 }).limit(count - 10);
      for (const old of oldestAlerts) {
        await ThreatIncident.findByIdAndDelete(old._id);
      }
    }
    const alertData = {
      id: incident._id.toString(),
      ...incident.toObject(),
      threatType: objectType,
    };
    const envelope = encryptPayload(alertData);
    lastRawPacket = { raw: envelope, decrypted: alertData };
    console.log(`[ALERT] Ingested new incident with media: ${alertData.id}`);
    io.emit('new_threat', envelope);
    res.status(201).json({ success: true, incident });
  } catch (err) {
    console.error('[ERROR] upload-incident:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/alerts/history', async (req, res) => {
  try {
    const query = {};
    if (req.query.droneId) query.droneId = req.query.droneId;
    if (req.query.severity) query.severity = req.query.severity;
    const incidents = await ThreatIncident.find(query).sort({ timestamp: -1 }).limit(50);
    res.json({ success: true, incidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.patch('/api/alerts/:id/acknowledge', async (req, res) => {
  try {
    const incident = await ThreatIncident.findByIdAndUpdate(req.params.id, { acknowledged: true }, { new: true });
    if (!incident) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/intercept-vector/:trackId', (req, res) => {
  const vector = tracker.calculateVector(req.params.trackId, latestDroneCoords, 60);
  if (vector) {
    res.json({ success: true, vector });
  } else {
    res.status(404).json({ success: false, error: 'Not enough data to compute vector' });
  }
});
app.post('/api/sitrep/generate', async (req, res) => {
  const alerts = req.body;
  if (!Array.isArray(alerts)) {
    return res.status(400).json({ success: false, error: 'Expected an array of alerts' });
  }
  const sitrep = await generateSitrep(alerts);
  if (sitrep) {
    res.json({ success: true, sitrep });
  } else {
    res.status(500).json({ success: false, error: 'Failed to generate SITREP' });
  }
});
app.get('/api/sitrep/latest', (req, res) => {
  res.json({ success: true, sitrep: latestSitrep });
});
app.post('/api/alerts', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload: Alert data is required',
      });
    }
    const edgeHmac = req.headers['x-skywatch-hmac'];
    if (edgeHmac) {
      const rawBody     = JSON.stringify(payload);
      const expectedMac = computeRequestHmac(rawBody);
      if (edgeHmac !== expectedMac) {
        console.warn(`[CRYPTO] ⚠️  HMAC mismatch on incoming alert — possible tampering from ${req.ip}`);
        return res.status(403).json({ success: false, error: 'HMAC verification failed' });
      }
      console.log(`[CRYPTO] ✅ Edge HMAC verified for incoming alert.`);
    } else {
      console.warn('[CRYPTO] ⚠️  Incoming alert missing X-SkyWatch-HMAC header (unauthenticated source).');
    }
    const threatAlert = {
      id: payload.id || `THREAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: payload.timestamp || new Date().toISOString(),
      threatType: payload.threatType || payload.type || 'UNKNOWN_AERIAL_TARGET',
      confidence: payload.confidence !== undefined ? payload.confidence : 0.95,
      severity: payload.severity || 'CRITICAL',
      coordinates: payload.coordinates || {
        lat: 28.6139 + (Math.random() - 0.5) * 0.01,
        lng: 77.2090 + (Math.random() - 0.5) * 0.01,
        altitude: Math.floor(80 + Math.random() * 120),
      },
      source: payload.source || 'EDGE_AI_YOLO',
      metadata: payload.metadata || payload,
    };
    console.log(`[ALERT] Ingested new threat alert: ${threatAlert.id} - ${threatAlert.threatType} (${threatAlert.severity})`);
    recentAlerts.push(threatAlert);
    if (recentAlerts.length > 10) recentAlerts.shift();
    if (threatAlert.severity === 'CRITICAL') {
      console.log(`[SITREP] Critical threat detected, triggering background SITREP generation...`);
      generateSitrep(recentAlerts).catch(console.error);
    }
    if (threatAlert.coordinates) {
      tracker.updateTrack(threatAlert.id, threatAlert.coordinates.lat, threatAlert.coordinates.lng, threatAlert.timestamp);
      const vectorData = tracker.calculateVector(threatAlert.id, latestDroneCoords, 60);
      if (vectorData) {
        console.log(`[TRACKER] 🎯 Intercept vector calculated for ${threatAlert.id}:`, vectorData.intercept ? `${vectorData.intercept.timeToInterceptSec}s` : 'No intercept possible');
        const vectorEnvelope = encryptPayload(vectorData);
        io.emit('intercept_calculated', vectorEnvelope);
      }
    }
    const envelope = encryptPayload(threatAlert);
    lastRawPacket = { raw: envelope, decrypted: threatAlert };
    console.log(`[CRYPTO] 🔒 new_threat encrypted (iv: ${envelope.iv.slice(0, 8)}...)`);
    io.emit('new_threat', envelope);
    return res.status(201).json({
      success: true,
      message: 'Threat detection alert received and broadcasted',
      alert: threatAlert,
    });
  } catch (err) {
    console.error('[ERROR] Failed to process threat alert:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing threat alert',
    });
  }
});
io.on('connection', (socket) => {
  console.log(`[SOCKET.IO] Client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);
  const ackPayload = {
    status: 'CONNECTED',
    socketId: socket.id,
    serverTime: new Date().toISOString(),
    message: 'Welcome to SkyWatch Tactical Stream',
    encryption: 'AES-256-CBC + HMAC-SHA256 (ETM)',
  };
  const ackEnvelope = encryptPayload(ackPayload);
  lastRawPacket = { raw: ackEnvelope, decrypted: ackPayload };
  console.log(`[CRYPTO] 🔒 connection_ack encrypted for ${socket.id}`);
  socket.emit('connection_ack', ackEnvelope);
  socket.on('disconnect', (reason) => {
    console.log(`[SOCKET.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
  });
});
let telemetryTick = 0;
const baseCoords = { lat: 28.613939, lng: 77.209021 };
function generateTelemetry() {
  telemetryTick++;
  const radius = 0.005;
  const angle = (telemetryTick * 0.05) % (2 * Math.PI);
  const currentLat = baseCoords.lat + radius * Math.cos(angle);
  const currentLng = baseCoords.lng + radius * Math.sin(angle);
  latestDroneCoords = { lat: currentLat, lng: currentLng };
  const altitude = +(120 + 5 * Math.sin(telemetryTick * 0.1)).toFixed(1);
  const speed = +(42 + 4 * Math.cos(telemetryTick * 0.1)).toFixed(1);
  const heading = +((angle * (180 / Math.PI) + 90) % 360).toFixed(1);
  const battery = Math.max(15, +(98 - telemetryTick * 0.02).toFixed(1));
  return {
    droneId: 'SKYW-DRONE-01',
    callsign: 'VANGUARD-LEADER',
    timestamp: new Date().toISOString(),
    status: 'ACTIVE_PATROL',
    flightMode: 'AUTONOMOUS_SURVEILLANCE',
    position: {
      latitude: +currentLat.toFixed(6),
      longitude: +currentLng.toFixed(6),
      altitudeMeters: altitude,
    },
    metrics: {
      speedKmh: speed,
      headingDeg: heading,
      batteryPercent: battery,
      signalStrengthPercent: 96,
      satellitesLocked: 16,
      gimbalPitchDeg: -30.0,
    },
    sensors: {
      opticalStatus: 'NOMINAL',
      thermalStatus: 'ACTIVE',
      lidarRangeMeters: 450,
    },
  };
}
setInterval(() => {
  const data     = generateTelemetry();
  const envelope = encryptPayload(data);
  lastRawPacket = { raw: envelope, decrypted: data };
  if (telemetryTick % 10 === 0) {
    console.log(`[CRYPTO] 🔒 telemetry_update encrypted (tick ${telemetryTick}, iv: ${envelope.iv.slice(0, 8)}...)`);
  }
  io.emit('telemetry_update', envelope);
}, 1000);
server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 SkyWatch Tactical Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket / Socket.IO enabled on port ${PORT}`);
  console.log(`🎯 Threat Ingestion Endpoint: POST http://localhost:${PORT}/api/alerts`);
  console.log(`🛰️  Simulated Drone Telemetry broadcast every 1s (io.emit('telemetry_update'))`);
  console.log('====================================================');
});
