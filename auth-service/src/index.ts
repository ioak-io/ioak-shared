import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import authRouter from './routes/user';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();

// Middleware setup
app.use(express.json({ limit: 5000000 }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);

const realmFromParams = (req: Request) => req.params.realm;

const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const realm = realmFromParams(req);
  if (!realm) {
    return res.status(400).json({ success: false, error: 'Realm parameter missing' });
  }

  const jwtMiddleware = expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${process.env.KEYCLOAK_URL}/realms/${realm}/protocol/openid-connect/certs`
    }) as GetVerificationKey,
    audience: 'account',
    issuer: `${process.env.KEYCLOAK_URL}/realms/${realm}`,
    algorithms: ['RS256']
  });

  jwtMiddleware(req, res, next);
};

app.use('/user/:realm', authRouter);
app.use('/admin/:realm', checkJwt, adminRouter);

// 404 Handler
app.use((_: any, res: any) => {
  res.status(404);
  res.send("Not found");
  res.end();
});

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err);
  res.status(500).send(process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.stack);
});

// Start Server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});
