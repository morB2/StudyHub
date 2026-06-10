import { loginUser } from "../services/userService.js";

/**
 * Controller to handle user login.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required fields",
      });
    }

    const user = await loginUser({ email, password });

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      error: error.message,
    });
  }
};
