import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables before importing modules that use them
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

// Import supabase connector after dotenv has loaded env vars
const { default: connectSupabase } = await import("./config/supabasedb.js");
const supabase = connectSupabase();

// Import the Express app after env and supabase setup to avoid early imports
const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
