import express from 'express';
import { getClaims, verifyAndGetClaims } from './middleware/jwt';

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.json({
    message: "hello"
  });
});

app.get("/healthcheck", verifyAndGetClaims, (req, res) => {
  res.json({
    message: "Claims validated and extracted successfully",
    claims: req.claims,
    headers: req.headers
  });
});

app.get("/healthcheck/no-verify", getClaims, (req, res) => {
  res.json({
    message: "Claims extracted successfully",
    claims: req.claims,
    headers: req.headers
  });
});

app.listen(port, () => {
  console.log(`Express service listening at http://localhost:${port}`);
});
