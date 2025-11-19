#!/usr/bin/env node

/**
 * MongoDB Connection Test
 * Tests connectivity to MongoDB Atlas cluster
 */

const mongoose = require('mongoose');
require('dotenv').config();

console.log('\n' + '='.repeat(60));
console.log('🔗 MONGODB CONNECTION TEST');
console.log('='.repeat(60) + '\n');

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

console.log('📍 Connection Details:');
console.log(`   URI: ${mongoUri.substring(0, 40)}...`);

// Extract cluster info
const clusterMatch = mongoUri.match(/@(.*?)\//);
const cluster = clusterMatch ? clusterMatch[1] : 'unknown';
console.log(`   Cluster: ${cluster}`);
console.log('\n⏳ Attempting connection...\n');

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ CONNECTION SUCCESSFUL!\n');
    console.log('Database Status:');
    console.log(`   Connected: Yes`);
    console.log(`   Host: ${cluster}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Error'}`);
    
    // List collections
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (!err) {
        console.log(`\n   Collections (${collections.length}):`);
        collections.forEach(col => {
          console.log(`     - ${col.name}`);
        });
      }
      
      mongoose.connection.close();
      console.log('\n' + '='.repeat(60));
      console.log('✨ MongoDB Atlas is accessible and working!');
      console.log('='.repeat(60) + '\n');
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error('❌ CONNECTION FAILED!\n');
    console.error('Error Details:');
    console.error(`   Message: ${err.message}`);
    
    if (err.message.includes('getaddrinfo')) {
      console.error('\n⚠️  DNS Resolution Error');
      console.error('   This usually means:');
      console.error('   - Your IP is not whitelisted in MongoDB Atlas');
      console.error('   - Network access rules are too restrictive');
    } else if (err.message.includes('authentication failed')) {
      console.error('\n⚠️  Authentication Error');
      console.error('   This means:');
      console.error('   - Username or password is incorrect');
      console.error('   - Check your MongoDB Atlas credentials');
    } else if (err.message.includes('timeout')) {
      console.error('\n⚠️  Connection Timeout');
      console.error('   This usually means:');
      console.error('   - Your IP is not whitelisted');
      console.error('   - MongoDB Atlas cluster is unreachable');
    }
    
    console.error('\n📋 Solution Steps:');
    console.error('   1. Go to: https://cloud.mongodb.com/v2');
    console.error('   2. Select your cluster');
    console.error('   3. Go to "Security" → "Network Access"');
    console.error('   4. Click "Add IP Address"');
    console.error('   5. Select "Allow access from anywhere" (0.0.0.0/0)');
    console.error('   6. Or add your specific IP address');
    console.error('   7. Wait 1-2 minutes for changes to apply');
    console.error('   8. Run this test again\n');
    
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  });
