import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js"; 
import groupRoutes from "./routes/groupRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/groups", groupRoutes);
app.use("/auth", authRoutes);

export default app;