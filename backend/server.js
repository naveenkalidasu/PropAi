require('dotenv').config();
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

// Connect to MongoDB
connectDB();

// CORS — allow frontend origin (env var in prod, wildcard in dev)
const allowedOrigin = process.env.CLIENT_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─────────────────────────────────────────────────
// In production: serve the built React frontend
// ─────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendBuild));

  // All non-API routes → React app (client-side routing)
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
} else {
  // Base route for dev connectivity check
  app.get('/', (req, res) => {
    res.json({ success: true, message: 'AI Placement Preparation Platform Server API' });
  });
}

// Socket.IO Server Setup
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

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled System Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
