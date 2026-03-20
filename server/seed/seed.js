require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const WasteItem = require('../models/WasteItem');
const Pickup = require('../models/Pickup');
const Center = require('../models/Center');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected for seeding');
};

const centers = [
  {
    name: 'Saahas Zero Waste',
    address: '123 Indiranagar, 100 Feet Road',
    city: 'Bengaluru',
    phone: '+91 98765 11111',
    hours: '9 AM - 5 PM (Mon–Sat)',
    rating: 4.8,
    coordinates: { lat: 12.9784, lng: 77.6408 },
    accepts: ['Laptop/PC', 'Mobile Phone', 'Battery', 'Charger/Cable', 'Tablet'],
    capacity: 500,
  },
  {
    name: 'GreenTech Recyclers',
    address: '456 Koramangala 5th Block',
    city: 'Bengaluru',
    phone: '+91 98765 22222',
    hours: '10 AM - 7 PM (Mon–Sun)',
    rating: 4.5,
    coordinates: { lat: 12.9352, lng: 77.6245 },
    accepts: ['TV/Monitor', 'Printer', 'Refrigerator', 'Washing Machine', 'Laptop/PC'],
    capacity: 800,
  },
  {
    name: 'Attero Recycling Hub',
    address: '789 Whitefield Main Road',
    city: 'Bengaluru',
    phone: '+91 98765 33333',
    hours: '9 AM - 6 PM (Mon–Fri)',
    rating: 4.3,
    coordinates: { lat: 12.9698, lng: 77.7499 },
    accepts: ['Laptop/PC', 'Mobile Phone', 'Battery', 'TV/Monitor', 'Other Electronics'],
    capacity: 1200,
  },
  {
    name: 'E-Parisaraa',
    address: '12 Electronic City Phase 1',
    city: 'Bengaluru',
    phone: '+91 98765 44444',
    hours: '8 AM - 8 PM (Mon–Sat)',
    rating: 4.6,
    coordinates: { lat: 12.8458, lng: 77.6692 },
    accepts: ['Laptop/PC', 'Mobile Phone', 'Tablet', 'Battery', 'Charger/Cable', 'Printer'],
    capacity: 600,
  },
  {
    name: 'Eco Recycle Mumbai',
    address: '22 Andheri East, MIDC',
    city: 'Mumbai',
    phone: '+91 98765 55555',
    hours: '9 AM - 6 PM (Mon–Sat)',
    rating: 4.4,
    coordinates: { lat: 19.1136, lng: 72.8697 },
    accepts: ['Laptop/PC', 'Mobile Phone', 'TV/Monitor', 'Battery', 'Refrigerator'],
    capacity: 700,
  },
  {
    name: 'Delhi E-Waste Hub',
    address: '77 Okhla Industrial Area Phase 2',
    city: 'Delhi',
    phone: '+91 98765 66666',
    hours: '10 AM - 6 PM (Mon–Sat)',
    rating: 4.2,
    coordinates: { lat: 28.5355, lng: 77.2587 },
    accepts: ['Laptop/PC', 'Mobile Phone', 'Printer', 'Battery', 'TV/Monitor'],
    capacity: 900,
  },
  {
    name: 'Recykal Hyderabad',
    address: '34 HITEC City, Madhapur',
    city: 'Hyderabad',
    phone: '+91 98765 77777',
    hours: '9 AM - 7 PM (Mon–Sat)',
    rating: 4.7,
    coordinates: { lat: 17.4435, lng: 78.3772 },
    accepts: ['Laptop/PC', 'Mobile Phone', 'Tablet', 'Charger/Cable', 'Other Electronics'],
    capacity: 500,
  },
  {
    name: 'GreenWaste Chennai',
    address: '56 Anna Nagar East',
    city: 'Chennai',
    phone: '+91 98765 88888',
    hours: '9 AM - 5 PM (Mon–Sat)',
    rating: 4.1,
    coordinates: { lat: 13.0878, lng: 80.2152 },
    accepts: ['TV/Monitor', 'Refrigerator', 'Washing Machine', 'Battery', 'Laptop/PC'],
    capacity: 400,
  },
];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await WasteItem.deleteMany({});
    await Pickup.deleteMany({});
    await Center.deleteMany({});
    console.log('🗑  Cleared existing data');

    // Create centers
    const createdCenters = await Center.insertMany(centers);
    console.log(`🏭 Created ${createdCenters.length} recycling centers`);

    // Create admin user (password will be hashed by pre-save hook)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ecollectgo.com',
      password: 'Admin@123',
      city: 'Bengaluru',
      phone: '+91 99999 00000',
      role: 'admin',
      points: 0,
    });
    console.log(`👑 Admin created: admin@ecollectgo.com / Admin@123`);

    // Create demo user
    const demoUser = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'Demo@123',
      city: 'Bengaluru',
      phone: '+91 98765 43210',
      role: 'user',
      points: 680,
      totalItemsRecycled: 7,
      co2Saved: 5.6,
      level: 'Eco Warrior',
    });
    console.log(`👤 Demo user created: priya@example.com / Demo@123`);

    // Create another user
    const user2 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      password: 'Demo@123',
      city: 'Mumbai',
      phone: '+91 91234 56789',
      role: 'user',
      points: 1200,
      totalItemsRecycled: 12,
      co2Saved: 11.2,
      level: 'Eco Warrior',
    });

    // Create waste items for demo user
    const wasteItems = [
      {
        user: demoUser._id,
        category: 'Laptop/PC',
        itemName: 'Dell Inspiron 15',
        brand: 'Dell',
        condition: 'Not Working',
        quantity: 1,
        pointsEarned: 150,
        co2Saved: 1.2,
        status: 'recycled',
      },
      {
        user: demoUser._id,
        category: 'Mobile Phone',
        itemName: 'iPhone 11',
        brand: 'Apple',
        condition: 'Damaged',
        quantity: 1,
        pointsEarned: 80,
        co2Saved: 0.7,
        status: 'recycled',
      },
      {
        user: demoUser._id,
        category: 'Battery',
        itemName: 'AA Batteries',
        brand: 'Duracell',
        condition: 'Not Working',
        quantity: 6,
        pointsEarned: 180,
        co2Saved: 1.8,
        status: 'logged',
      },
      {
        user: demoUser._id,
        category: 'Charger/Cable',
        itemName: 'USB-C Cables',
        brand: 'Anker',
        condition: 'Damaged',
        quantity: 4,
        pointsEarned: 80,
        co2Saved: 0.4,
        status: 'logged',
      },
      {
        user: user2._id,
        category: 'TV/Monitor',
        itemName: 'Samsung 32" LED TV',
        brand: 'Samsung',
        condition: 'Not Working',
        quantity: 1,
        pointsEarned: 200,
        co2Saved: 3.0,
        status: 'recycled',
      },
    ];

    const createdItems = await WasteItem.insertMany(wasteItems);
    console.log(`♻  Created ${createdItems.length} waste items`);

    // Create a pickup for demo user
    const pickup = await Pickup.create({
      user: demoUser._id,
      items: [createdItems[2]._id, createdItems[3]._id],
      address: '42 MG Road, Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      timeSlot: '9 AM - 12 PM',
      status: 'pending',
      notes: 'Please call before arrival.',
    });

    // Update item status
    await WasteItem.updateMany(
      { _id: { $in: [createdItems[2]._id, createdItems[3]._id] } },
      { status: 'pickup_requested', pickup: pickup._id }
    );

    // Create a completed pickup
    await Pickup.create({
      user: demoUser._id,
      items: [createdItems[0]._id, createdItems[1]._id],
      address: '42 MG Road, Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
      scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      timeSlot: '12 PM - 3 PM',
      status: 'completed',
      pointsAwarded: 230,
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    });

    console.log('📦 Created sample pickups');
    console.log('\n✅ Database seeded successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('  LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('  Admin:     admin@ecollectgo.com  /  Admin@123');
    console.log('  Demo User: priya@example.com     /  Demo@123');
    console.log('  User 2:    rahul@example.com     /  Demo@123');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
