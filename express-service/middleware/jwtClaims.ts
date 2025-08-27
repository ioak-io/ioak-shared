import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Load the Keycloak public key (RS256)
const publicKey = fs.readFileSync(__dirname + "/keycloak.pem", "utf8");

function jwtClaims(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "No Authorization header" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return res.status(401).json({ error: "Invalid Authorization header format" });
  }

  const token = parts[1];

  try {
    // Verify the signature
    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    req.claims = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token", details: (err as Error).message });
  }
}

export default jwtClaims;
