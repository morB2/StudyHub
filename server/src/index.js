import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectSupabase from "./config/supabasedb.js";
import app from "./app.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabase = connectSupabase();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});