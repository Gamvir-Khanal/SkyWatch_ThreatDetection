const mongoose = require('mongoose');
const DroneSchema = new mongoose.Schema({
  droneId: { type: String, unique: true, required: true },
  callsign: { type: String },
  sector: { type: String },
  streamUrl: { type: String },
  apiKey: { type: String, required: true },
  status: {
    type: String,
    enum: ['IDLE', 'PATROLLING', 'INTERCEPTING', 'RTH', 'EMERGENCY', 'ONLINE', 'OFFLINE', 'ALERT'],
    default: 'PATROLLING'
  },
  telemetry: {
    battery: { type: Number, default: 100 },
    altitude: { type: Number, default: 55 },
    speed: { type: Number, default: 12 },
    heading: { type: Number, default: 0 },
    location: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.2090 }
    }
  },
  waypoints: [{
    lat: Number,
    lng: Number,
    altitude: Number,
    order: Number
  }],
  currentWaypointIndex: { type: Number, default: 0 },
  registeredAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Drone', DroneSchema);
