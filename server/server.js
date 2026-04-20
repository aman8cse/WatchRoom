import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initializeSocket } from "./src/Socket/socketManager.js";

dotenv.config();

const PORT = process.env.PORT;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

initializeSocket(io);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`CoWatch running on port ${PORT}`)
  })
}).catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exit(1)
})