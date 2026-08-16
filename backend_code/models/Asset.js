const mongoose = require('mongoose');
const AssetSchema = new mongoose.Schema({
  assetId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  callsign: { type: String },
  status: { type: String, default: 'IDLE' },
  maintenanceScheduled: { type: Boolean, default: false },
  diagnostics: { type: Object, default: {} },
  icon: { type: String, default: 'directions_car' },
  theme: { type: String, default: 'primary' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Asset', AssetSchema);
