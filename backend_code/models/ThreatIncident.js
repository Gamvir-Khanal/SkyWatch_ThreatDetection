const mongoose = require('mongoose');
const ThreatIncidentSchema = new mongoose.Schema({
  droneId: { type: String },
  objectType: { type: String },
  confidence: { type: Number },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL', 'SEVERE']
  },
  threatLevel: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL', 'SEVERE']
  },
  detailedDescription: { type: String },
  sector: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  snapshotUrl: { type: String },
  incidentMediaUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
  acknowledged: { type: Boolean, default: false }
});
module.exports = mongoose.model('ThreatIncident', ThreatIncidentSchema);
