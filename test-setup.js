const mongoose = require('mongoose');
const express = require('express');

// Test database connection
async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-wardrobe', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connection successful');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Test required environment variables
function testEnvironment() {
  console.log('🔍 Testing environment variables...');
  const required = ['JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.log('📝 Please set these in your .env file');
    return false;
  }
  
  console.log('✅ Environment variables configured');
  return true;
}

// Test server startup
async function testServer() {
  try {
    console.log('🔍 Testing server startup...');
    const app = express();
    const PORT = process.env.PORT || 5000;
    
    app.get('/test', (req, res) => {
      res.json({ status: 'OK', message: 'Server is running' });
    });
    
    const server = app.listen(PORT, () => {
      console.log('✅ Server started successfully on port', PORT);
      server.close();
      return true;
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Running Digital Wardrobe setup tests...\n');
  
  const envTest = testEnvironment();
  if (!envTest) {
    console.log('\n❌ Setup test failed. Please configure your environment variables.');
    process.exit(1);
  }
  
  const dbTest = await testDatabase();
  if (!dbTest) {
    console.log('\n❌ Setup test failed. Please check your database connection.');
    process.exit(1);
  }
  
  const serverTest = await testServer();
  if (!serverTest) {
    console.log('\n❌ Setup test failed. Please check your server configuration.');
    process.exit(1);
  }
  
  console.log('\n🎉 All tests passed! Your Digital Wardrobe is ready to go!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run dev (for backend)');
  console.log('2. Run: cd frontend && npm start (for frontend)');
  console.log('3. Open: http://localhost:3000');
}

// Load environment variables
require('dotenv').config();

// Run tests
runTests().catch(console.error);
