import connectSupabase from "../config/supabasedb.js";

const supabase = connectSupabase();

export const createUser = async ({ name, email, password }) => {
  // הכנסת כל השדות לטבלה
  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email, password }])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data;
};