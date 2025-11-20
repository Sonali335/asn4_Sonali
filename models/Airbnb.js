const mongoose = require("mongoose");

const AirbnbSchema = new mongoose.Schema({
  id: String,
  NAME: String,
  host_identity_verified: String,
  neighbourhood: String,
  country: String,
  instant_bookable: String,
  property_type: String,
  thumbnail: String,
  price: String     
}, { collection: "airbnb_list" });

module.exports = mongoose.model("Airbnb", AirbnbSchema);
