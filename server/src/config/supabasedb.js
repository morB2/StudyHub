import { createClient } from "@supabase/supabase-js";

const connectSupabase = () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    // --- תוספת הבדיקה שלנו שתדפיס רק את תחילת המפתח ---
    console.log(
      "🔍 Supabase Key starts with:", 
      supabaseKey ? supabaseKey.substring(0, 15) + "..." : "UNDEFINED"
    );
    // --------------------------------------------------

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "SUPABASE_URL or SUPABASE_KEY is not defined in environment variables",
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("✓ Supabase connected successfully");
    return supabase;
  } catch (error) {
    console.error("✗ Supabase connection failed:", error.message);
    process.exit(1);
  }
};

export default connectSupabase;