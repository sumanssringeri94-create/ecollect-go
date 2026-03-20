const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    hours: {
      type: String,
      default: '9 AM - 6 PM',
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    accepts: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
    capacity: {
      type: Number,
      default: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Center', centerSchema);
