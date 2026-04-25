require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const { connectMongoDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const initializeSockets = require('./sockets/index');

// Import routes
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const noteRoutes = require('./routes/notes');
const taskRoutes = require('./routes/tasks');
const resourceRoutes = require('./routes/resources');
const sessionRoutes = require('./routes/sessions');
const datasetRoutes = require('./routes/datasets');
const discussionRoutes = require('./routes/discussions');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ─── Middleware ───
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'studysync-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// ─── Root Route (IMPORTANT for Railway) ───
app.get("/", (req, res) => {
  res.send("🚀 StudySync backend is running");
});

// ─── API Routes ───
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/discussions', discussionRoutes);

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ───
app.use(errorHandler);

// ─── Initialize Sockets ───
initializeSockets(io);

// ─── Start Server ───
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectMongoDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

startServer();