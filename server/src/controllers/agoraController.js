import { generateAgoraToken } from "../services/agoraService.js";
import connectSupabase from "../config/supabasedb.js";
const supabase = typeof connectSupabase === "function" ? connectSupabase() : connectSupabase;

export async function getAgoraToken(req, res) {
  try {
    const { channel } = req.query;
    const authHeader = req.headers.authorization;
    const userId = req.headers['x-user-id']; // 💡 לוקחים את מזהה המשתמש ישר מהבקשה

    if (!channel) return res.status(400).json({ error: "channel is required" });
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Missing User ID" });
    }

    const groupId = channel.replace("group-", "");
    console.log(`🔍 Checking if user ${userId} is in group ${groupId}...`);

    // שאילתה לסופאבייס: האם המשתמש באמת רשום כחבר קבוצה?
    const { data: isMember, error: dbError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (dbError) {
      console.error("❌ Supabase DB Error:", dbError);
    }

    if (dbError || !isMember) {
      return res.status(403).json({ error: "Forbidden: You are not a member of this group" });
    }

    console.log("✅ User is a member! Generating token...");
    const token = generateAgoraToken(channel);

    return res.json({ token, channel });

  } catch (err) {
    console.error("❌ Server Crash:", err.message);
    return res.status(500).json({ 
      error: "Server crashed", 
      details: err.message 
    });
  }
}