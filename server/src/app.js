import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/folders", folderRoutes);

export default app;