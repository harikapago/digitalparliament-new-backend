// Import necessary modules
const mongoose = require('mongoose');

// Define MLA schema
const mlaSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  dob: {
    type: Date,
   
  },
  gender: {
    type: String,
   
  },
  mlaPhoto:{
    type: String,
   
  },
  designation: {
    type: String,
   
  },
  presentAddress: {
    type: String,
   
  },
  permanentAddress: {
    type: String,
   
  },
  aadharCardNumber: {
    type: Number,
   
    unique: true
  },
  aadharCardPhoto: {
    type: String,
   
  },

  email: {
    type: String,
   
    unique: true
  },
  password:{
    type:String
  },
  
  phone: {
    type: String,
   
  },
  highestEducationQualification: {
    type: String,
   
  },
  party: {
    type: String,
   
  },
  electionSymbolPath: {
    type: String,
   
  },
  nominationPapersPath: {
    type: String,
   
  },
  state: {
    type: String,
   
  },
  district: {
    type: String,
   
  },
  constituency: {
    type: String,
   
  },
  MP:{
    type: String,
  },
  pinCodes: {
    type: [String],
   
  },
  latitude: {
    type: String,
   
  },
  longitude: {
    type: String,
   
  },
  mlaApprovalStatus: {
    type: String,
    default: 'pending', 
  },
});

// Create the MLA model
const MLA = mongoose.model('MLA', mlaSchema);

module.exports = MLA;
