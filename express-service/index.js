const express = require("express");
const jwtClaims = require("./middleware/jwtClaims");

const app = express();
const port = 3000;

app.get("/", jwtClaims, (req, res) => {
  res.json({
    message: "Claims extracted successfully",
    claims: req.claims,
    headers: req.headers
  });
});

app.listen(port, () => {
  console.log(`Express service listening at http://localhost:${port}`);
});
