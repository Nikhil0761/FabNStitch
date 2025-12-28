import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/* ============================================
   Generate JWT Token
============================================ */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role, // ✅ role included
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ============================================
   Authenticate Token (Any Logged-in User)
============================================ */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user; // { id, email, role }
    next();
  });
};

/* ============================================
   Authorize Role (Customer / Tailor / Admin)
============================================ */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }

    next();
  };
};
