const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI exists
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.log('📝 Please set MONGODB_URI in your Render Environment tab');
      
      // For development fallback (optional - remove in production)
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ Using fallback: mongodb://localhost:27017/interview');
        const fallbackURI = 'mongodb://localhost:27017/interview';
        const conn = await mongoose.connect(fallbackURI);
        console.log(`📡 MongoDB Connected (fallback): ${conn.connection.host}`);
        return;
      }
      
      process.exit(1);
    }

    // Log that we're connecting (without exposing full URI)
    console.log('📡 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, {
      // These options help with connection stability
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('authentication')) {
      console.error('🔑 Authentication failed. Check your username and password in MONGODB_URI');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 Host not found. Check your cluster URL in MONGODB_URI');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🔌 Connection refused. Make sure MongoDB is running');
    }
    
    // Don't exit in development, but exit in production
    if (process.env.NODE_ENV === 'production') {
      console.error('🛑 Exiting due to MongoDB connection failure in production');
      process.exit(1);
    } else {
      console.log('⚠️ Continuing in development mode without MongoDB');
    }
  }
};

module.exports = connectDB;
