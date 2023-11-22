// partyschema.js
const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  partyName: { type: String, required: true },
  partyType: { type: String, required: true },
  partySymbol: { type: String, required: true },
  partyCode: { type: String, required: true },
  aboutShortDescription: { type: String },
  aboutLongDescription: { type: String },
  missionShortDescription: { type: String },
  missionLongDescription: { type: String },
  visionShortDescription: { type: String },
  visionLongDescription: { type: String },
  manifestoShortDescription: { type: String },
  manifestoLongDescription: { type: String },
  manifestoFilesinpdf: { type: String }, // assuming a file path or URL
  TotalNumberOfMembers: { type: Number },
  createdBy: { type: String, required: true },
  modifiedBy: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now },
  status: { type: String },
  fullAddress: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  postcode: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  contactNo1: { type: String },
  contactNo2: { type: String },
});

const Party = mongoose.model('Party', partySchema);

module.exports = {
  Party,
};
