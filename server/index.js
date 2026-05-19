import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectSupabase from "./db/supabasedb.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Supabase
const supabase = connectSupabase();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(3001, () => console.log("Server running on port 3001"));
