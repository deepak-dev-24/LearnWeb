require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { app } = require('./app');

const dns = require("dns")

dns.setServers([
	'1.1.1.1',
	'8.8.8.8'
])

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 “LearnWeb: Personal Distraction-Free Study Platform');
      console.log('='.repeat(60));
      console.log(`📡 API Server running on port: ${PORT}`);
      console.log(`🗄️  Database: Connected to MongoDB`);
      console.log(`🔐 JWT Auth: Enabled`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();


