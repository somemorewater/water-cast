const {
  signupUser,
  loginUser,
  getCurrentUser,
} = require("../services/auth.service");

const signup = async (req, res) => {
  try {
    const result = await signupUser(req.body);
    return res.status(201).json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || "Signup failed" });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || "Login failed" });
  }
};

const me = async (req, res) => {
  const result = getCurrentUser(req.user);
  return res.json(result);
};

module.exports = { signup, login, me };
