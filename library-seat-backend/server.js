const app = require('./src/app');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const cors = require('cors');


app.use(cors({
  origin: 'http://localhost:3000', // your frontend origin
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.io setup
require('./src/socket/socketHandlers')(io);

const PORT = 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});