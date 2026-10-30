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

const MongooseCenter = mongoose.models.Center || mongoose.model('Center', centerSchema);

module.exports = new Proxy(MongooseCenter, {
  construct(target, args) {
    if (process.env.USE_LOCAL_DB === 'true') {
      const { createModelInstance } = require('../localDb');
      return createModelInstance('centers', args[0]);
    }
    return new target(...args);
  },
  get(target, prop) {
    if (process.env.USE_LOCAL_DB === 'true') {
      const { Center } = require('../localDb');
      return Center[prop];
    }
    return target[prop];
  },
});
