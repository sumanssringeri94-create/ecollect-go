const mongoose = require('mongoose');

const wasteItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Laptop/PC',
        'Mobile Phone',
        'Tablet',
        'TV/Monitor',
        'Battery',
        'Charger/Cable',
        'Printer',
        'Refrigerator',
        'Washing Machine',
        'Other Electronics',
      ],
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    condition: {
      type: String,
      enum: ['Working', 'Not Working', 'Damaged', 'Unknown'],
      default: 'Unknown',
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    co2Saved: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['logged', 'pickup_requested', 'collected', 'recycled'],
      default: 'logged',
    },
    pickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pickup',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate points and CO2 based on category
wasteItemSchema.statics.getCategoryMeta = function (category) {
  const meta = {
    'Laptop/PC':         { points: 150, co2: 1.2 },
    'Mobile Phone':      { points: 80,  co2: 0.7 },
    'Tablet':            { points: 100, co2: 0.9 },
    'TV/Monitor':        { points: 200, co2: 3.0 },
    'Battery':           { points: 30,  co2: 0.3 },
    'Charger/Cable':     { points: 20,  co2: 0.1 },
    'Printer':           { points: 120, co2: 1.0 },
    'Refrigerator':      { points: 300, co2: 5.0 },
    'Washing Machine':   { points: 250, co2: 4.0 },
    'Other Electronics': { points: 50,  co2: 0.5 },
  };
  return meta[category] || { points: 50, co2: 0.5 };
};

const MongooseWasteItem = mongoose.models.WasteItem || mongoose.model('WasteItem', wasteItemSchema);

module.exports = new Proxy(MongooseWasteItem, {
  construct(target, args) {
    if (process.env.USE_LOCAL_DB === 'true') {
      const { createModelInstance } = require('../localDb');
      return createModelInstance('wasteitems', args[0]);
    }
    return new target(...args);
  },
  get(target, prop) {
    if (process.env.USE_LOCAL_DB === 'true') {
      const { WasteItem } = require('../localDb');
      return WasteItem[prop];
    }
    return target[prop];
  },
});
