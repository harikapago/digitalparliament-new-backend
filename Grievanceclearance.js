const mongoose = require('mongoose');

const grievanceClearanceSchema = new mongoose.Schema({
  clearedBy: {
    type: String,
    required: true,
  },
  clearedDate: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,

  },
  grievance_id: {
    type: String,
    required: true,
  },

  supportingPhotos: [
    {
      type: String, // Assuming the photos are stored as URLs or file paths
      
    },
  ],
});

const GrievanceClearance = mongoose.model('GrievanceClearance', grievanceClearanceSchema);

module.exports = GrievanceClearance;
