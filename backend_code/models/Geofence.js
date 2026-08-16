const mongoose = require('mongoose');
const GeofenceSchema = new mongoose.Schema({
  sectorName: { type: String, required: true },
  polygon: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  threatLevel: { type: String, default: 'RESTRICTED' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Geofence', GeofenceSchema);
