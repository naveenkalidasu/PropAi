// Load environment variables FIRST
require('dotenv').config();

// ─────────────────────────────────────────────────
// ENVIRONMENT VALIDATION & DEBUGGING
// ─────────────────────────────────────────────────
console.log('🔍 Environment Check:');
console.log(`📌 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`📌 PORT: ${process.env.PORT || '5000'}`);
console.log(`📌 MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ NOT SET'}`);
console.log(`📌 CLIENT_ORIGIN: ${process.env.CLIENT_ORIGIN || 'Not set (using *)'}`);

// Check for critical environment variables
if (!process.env.MONGODB_URI) {
  console.error('\n❌ CRITICAL ERROR: MONGODB_URI is not defined!');
  console.error('📝 Please add it in Render Dashboard:');
  console.error('   → Select your service');
  console.error('   → Click "Environment" tab');
  console.error('   → Add Environment Variable:');
  console.error('   → Key: MONGODB_URI');
  console.error('   → Value: mongodb+srv://naveenkalidasu_db_user:S9SlS6rP2V4gYI3i@cluster0.dg5po5m.mongodb.net/interview');
  console.error('   → Click "Save"');
  console.error('   → Click "Manual Deploy" → "Deploy latest commit"\n');
  
  if (process.env.NODE_ENV === 'production') {
    console.error('🛑 Exiting due to missing MONGODB_URI in production');
    process.exit(1);
  } else {
    console.log('⚠️ Continuing in development mode without MongoDB (fallback will be used)');
  }
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Initialize Express & Create Server
const app = express();
const server = http.createServer(app);

// ─────────────────────────────────────────────────
// CONNECT TO MONGODB
// ─────────────────────────────────────────────────
// Only try to connect if URI exists
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.log('⚠️ Skipping MongoDB connection (MONGODB_URI not set)');
}

// ─────────────────────────────────────────────────
// CORS CONFIGURATION
// ─────────────────────────────────────────────────
const allowedOrigin = process.env.CLIENT_ORIGIN || '*';
console.log(`🔗 CORS allowed origin: ${allowedOrigin}`);

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─────────────────────────────────────────────────
// SERVE FRONTEND (Production) / API Info (Development)
// ─────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '..', 'frontend', 'dist');
  
  // Check if frontend build exists
  const fs = require('fs');
  if (fs.existsSync(frontendBuild)) {
    console.log(`📁 Serving frontend from: ${frontendBuild}`);
    app.use(express.static(frontendBuild));

    // All non-API routes → React app (client-side routing)
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(frontendBuild, 'index.html'));
    });
  } else {
    console.warn(`⚠️ Frontend build not found at: ${frontendBuild}`);
    app.get('/', (req, res) => {
      res.json({ 
        success: true, 
        message: 'AI Placement Preparation Platform Server API (Production)',
        note: 'Frontend build not found. Please run npm run build in frontend folder.'
      });
    });
  }
} else {
  // Base route for dev connectivity check
  app.get('/', (req, res) => {
    res.json({ 
      success: true, 
      message: 'AI Placement Preparation Platform Server API',
      environment: 'development',
      mongodb: process.env.MONGODB_URI ? 'Configured' : 'Not configured'
    });
  });
}

// ─────────────────────────────────────────────────
// SOCKET.IO SERVER
// ─────────────────────────────────────────────────
const io = socketIo(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Join a specific interview session room
  socket.on('join_interview', ({ interviewId }) => {
    socket.join(interviewId);
    console.log(`👤 Socket ${socket.id} joined interview room: ${interviewId}`);
  });

  // Handle client signals
  socket.on('interview_action', ({ interviewId, action, data }) => {
    console.log(`🎙️ Action "${action}" in interview ${interviewId} from client.`);
    socket.to(interviewId).emit('interviewer_status', { action, data });
  });

  // Real-time speech status
  socket.on('candidate_speech_status', ({ interviewId, text }) => {
    io.in(interviewId).emit('interviewer_feedback', {
      timestamp: new Date(),
      status: 'analyzing',
      length: text.length
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled System Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📌 MongoDB: ${process.env.MONGODB_URI ? '✅ Connected' : '❌ Not connected'}`);
  console.log(`📌 API URL: http://localhost:${PORT}/api`);
  console.log(`📌 Health Check: http://localhost:${PORT}/\n`);
});

// ─────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
