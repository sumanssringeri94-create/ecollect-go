const mongoose = require('mongoose');
const dns = require('dns');

// Use reliable DNS servers to prevent queryTxt ETIMEOUT on Windows when connecting to Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = async () => {
  if (process.env.USE_LOCAL_DB === 'true' || !process.env.MONGO_URI) {
    process.env.USE_LOCAL_DB = 'true';
    console.log('✅ Local Embedded Database Connected (server/local-database.json)');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection error: ${error.message}`);
    console.log('🔄 Falling back to Local Embedded Database (server/local-database.json)');
    process.env.USE_LOCAL_DB = 'true';
  }
};

module.exports = connectDB;
