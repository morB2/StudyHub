import { randomBytes, scryptSync } from "crypto";
import connectSupabase from "../config/supabasedb.js";

const supabase = connectSupabase();

const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
};

export const createUser = async ({ name, email, password }) => {
  const existingRes = await supabase.from("users").select("id").eq("email", email).maybeSingle();
  if (existingRes.error) throw new Error(existingRes.error.message || "Failed checking existing email");
  if (existingRes.data) {
    const e = new Error("Email already exists");
    e.status = 409;
    throw e;
  }

  const hashedPassword = hashPassword(password);
  const { data, error } = await supabase.from("users").insert([{ name, email, password: hashedPassword }]).select();
  if (error) {
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
  if (error) throw new Error(error.message);
  return data;
};

export const verifyUser = async ({ email, password }) => {
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
  if (error) throw new Error(error.message || "Failed to fetch user during login");
  
  if (!user) {
    const e = new Error("Invalid email or password");
    e.status = 401;
    throw e;
  }

  const [salt, originalHash] = user.password.split(":");
  const incomingHash = scryptSync(password, salt, 64).toString("hex");

  if (incomingHash !== originalHash) {
    const e = new Error("Invalid email or password");
    e.status = 401;
    throw e;
  }

  const { password: _, ...userWithoutPassword } = user;
  const sessionToken = randomBytes(16).toString("hex"); 

  return { user: userWithoutPassword, token: sessionToken };
};


export const updateUserProfile = async ({ id, name, bio, institution, photoURL, file }) => {
  let finalPhotoUrl = photoURL;

  if (file) {
    const fileName = `${id}_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw new Error("שגיאה בהעלאת התמונה: " + uploadError.message);

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    finalPhotoUrl = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('users')
    .update({ 
      name: name || null,
      bio: bio || null, 
      institution: institution || null, 
      "photoURL": finalPhotoUrl || null 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error("שגיאה בעדכון הפרופיל: " + error.message);

  const { password: _, ...updatedUser } = data;
  return updatedUser;
};

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const e = new Error("Invalid email or password");
    e.status = 401;
    throw e;
  }

  const [salt, key] = data.password.split(":");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  if (key !== derivedKey) {
    const e = new Error("Invalid email or password");
    e.status = 401;
    throw e;
  }

  // Remove password from returned user object
  const { password: _, ...userWithoutPassword } = data;
  return userWithoutPassword;
};
