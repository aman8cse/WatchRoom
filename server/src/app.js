import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({
        message: "CoWatch server is running"
    });
});

export default app;