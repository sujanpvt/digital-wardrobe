const mongoose = require('mongoose');

async function testMongoDB() {
  console.log('🔍 Testing MongoDB connection...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-wardrobe', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ name: 'Digital Wardrobe Test' });
    await testDoc.save();
    console.log('✅ Test document created successfully');
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.disconnect();
    console.log('✅ MongoDB connection test completed successfully!');
    console.log('🚀 Your Digital Wardrobe is ready for full functionality!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('');
    console.log('💡 Solutions:');
    console.log('1. Make sure MongoDB Atlas is set up correctly');
    console.log('2. Check your .env file has the correct MONGODB_URI');
    console.log('3. Ensure your Atlas cluster is running');
    console.log('4. Verify network access allows your IP');
    console.log('');
    console.log('📖 See mongodb-setup.md for detailed instructions');
  }
}

// Load environment variables
require('dotenv').config();

// Run test
testMongoDB();

