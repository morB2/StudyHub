import { randomBytes, scryptSync } from "crypto";
import connectSupabase from "../config/supabasedb.js";

const supabase = connectSupabase();

const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
};

export const createUser = async ({ name, email, password }) => {
  // בדיקה אם המייל כבר קיים (מניעת race-condition ברמת השרת)
  const existingRes = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingRes.error) {
    throw new Error(
      existingRes.error.message || "Failed checking existing email",
    );
  }

  if (existingRes.data) {
    const e = new Error("Email already exists");
    e.status = 409;
    throw e;
  }

  // הכנסת כל השדות לטבלה (סיסמה כבר מתחוללת)
  const hashedPassword = hashPassword(password);

  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email, password: hashedPassword }])
    .select();

  if (error) {
    // Postgres unique violation code is '23505'
    if (error.code === "23505") {
      const e = new Error("Email already exists");
      e.status = 409;
      throw e;
    }
    throw new Error(error.message);
  }

  return data;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
