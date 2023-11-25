const mongoose = require('mongoose');

// Define ConstituencyData Schema
const constituencyDataSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  constituencyName: {
    type: String,
    required: true,
  },
  mlaName: {
    type: String,
    required: true,
  },
  mpName: {
    type: String,
    required: true,
  },
  corporatorName: {
    type: String,
   
  },
  location: {
    pincodes: {
      type: [Number],
      required: true,
    },
    Latitude: {
      type: String,
     
    },
    Longitude: {
      type: String,
      
    },
  },
});

// Create ConstituencyData model
const ConstituencyData = mongoose.model('ConstituencyData', constituencyDataSchema);

module.exports = ConstituencyData;
