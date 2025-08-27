import express from 'express';
import { jwtClaims } from './middleware/jwtClaims';

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.json({
    message: "hello"
  });
});
app.get("/healthcheck", jwtClaims, (req, res) => {
  console.log("entered health check");
  res.json({
    message: "Claims extracted successfully",
    claims: req.claims,
    headers: req.headers
  });
});

app.listen(port, () => {
  console.log(`Express service listening at http://localhost:${port}`);
});
