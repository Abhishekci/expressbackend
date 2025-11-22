const jwt = require("jsonwebtoken");

const authenticationToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  // replace existing jwt.verify(...) with this (temporary)
  jwt.verify(token, process.env.JWT_SECRET || "abhi", (err, decoded) => {
    if (err) {
      console.error("JWT verify error:", err.message);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    console.log("Decoded token payload:", decoded);
    req.user = decoded.user;
    next();
  });
};

module.exports = authenticationToken;
