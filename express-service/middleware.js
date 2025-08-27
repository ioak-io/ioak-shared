const jwt = require("jsonwebtoken");

function jwtClaims(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "No Authorization header" });
  }

  const token = authHeader.split(" ")[1]; // remove "Bearer "
  if (!token) {
    return res.status(401).json({ error: "Invalid Authorization header" });
  }

  try {
    const decoded = jwt.decode(token, { complete: false });
    if (!decoded) {
      return res.status(400).json({ error: "Failed to decode JWT" });
    }

    req.claims = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ error: "Error decoding token", details: err.message });
  }
}

module.exports = jwtClaims;
