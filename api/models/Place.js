import mongoose from "mongoose";

// place için schema
const { Schema } = mongoose;

const placeSchema = new Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  address: String,
  photos: [String],
  description: String,
  perks: [String],
  extraInfo: String,
  checkIn: Number,
  checkOut: Number,
  maxGuests: Number,
  price: Number,
});

const PlaceModel = mongoose.model("Place", placeSchema);

export default PlaceModel;

// PlaceModel hazırladık, export ettik, bunu index.js'de import edip kullanacağız
