const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  patientId: {
    type: String,
    index: true
  },
  patientName: {
    type: String
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  altitude: {
    type: Number,
    default: 0
  },
  speed: {
    type: Number,
    default: 0
  },
  heading: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number
  },
  zone: {
    type: String,
    enum: ['ICU', 'ER', 'Ward-A', 'Ward-B', 'Ward-C', 'Lobby', 'Pharmacy', 'Lab', 'Cafeteria', 'Outdoor', 'Unknown'],
    default: 'Unknown'
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'alert'],
    default: 'active'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for geospatial queries
LocationSchema.index({ latitude: 1, longitude: 1 });
LocationSchema.index({ createdAt: -1 });

// Static method to get latest location for each device
LocationSchema.statics.getLatestLocations = async function() {
  return this.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: {
      _id: '$deviceId',
      doc: { $first: '$$ROOT' }
    }},
    { $replaceRoot: { newRoot: '$doc' } }
  ]);
};

module.exports = mongoose.model('Location', LocationSchema);
