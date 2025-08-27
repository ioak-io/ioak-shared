import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const client = jwksClient({
  jwksUri: "https://keycloak.ioak.io/realms/echo/protocol/openid-connect/certs",
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function jwtClaims(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No Authorization header" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token", details: err.message });
    (req as any).claims = decoded;
    next();
  });
}
