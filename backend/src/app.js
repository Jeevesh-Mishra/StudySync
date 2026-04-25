require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

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

// ─── Serve Frontend Static Files ───
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// ─── API Routes (versioned) ───
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/discussions', discussionRoutes);

// ─── Health check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Catch-all: serve frontend for SPA ───
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'index.html'));
});

// ─── Error Handler ───
app.use(errorHandler);

// ─── Initialize Sockets ───
initializeSockets(io);

// ─── Start Server ───
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectMongoDB();

  server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║         StudySync+ Server Running            ║
║──────────────────────────────────────────────║
║  🌐 http://localhost:${PORT}                   ║
║  📡 API: http://localhost:${PORT}/api/v1        ║
║  🔌 Socket.IO: Connected                    ║
╚══════════════════════════════════════════════╝
    `);
  });
};

startServer();
