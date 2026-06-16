import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/folders", folderRoutes);
app.use("/groups", groupRoutes);
app.use("/auth", authRoutes);
app.use("/materials", materialRoutes);
app.use("/meetings", meetingRoutes);
app.use("/notices", noticeRoutes);
app.use("/ai", aiRoutes);

export default app;