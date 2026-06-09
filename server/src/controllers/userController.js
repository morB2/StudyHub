import { createUser, getAllUsers, verifyUser, updateUserProfile } from "../services/userService.js";

export const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // --- השורות החדשות שהוספנו לבדיקת אורך הסיסמה ---
    if (password.length < 4) {
      return res.status(400).json({ error: "הסיסמה חייבת להכיל לפחות 4 תווים" });
    }
    //

    const newUser = await createUser({ name, email, password });
    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  }
};

export const fetchUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await verifyUser({ email, password });
    res.status(200).json({ message: "Login successful", ...result });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  }
};

export const editUser = async (req, res) => {
  try {
    // הוספנו את name לכאן:
    const { id, name, bio, institution, photoURL } = req.body;
    const file = req.file;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // הוספנו את name גם לקריאה של הפונקציה:
    const updatedUser = await updateUserProfile({ id, name, bio, institution, photoURL, file });

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};