import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js"; 

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from server!" });
});

export default app;