import { createUser, getAllUsers } from "../services/userService.js";

export const addUser = async (req, res) => {
  try {
    // קליטת כל השדות מהבקשה
    const { name, email, password } = req.body;

    // וידוא שכל שדות החובה קיימים
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    // שליחת הנתונים כאובייקט לשכבת ה-Service
    const newUser = await createUser({ name, email, password });

    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      error: error.message,
    });
  }
};

export const fetchUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
