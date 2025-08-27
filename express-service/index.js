const express = require("express");
const middleware = require("./middleware");

const app = express();
const port = 3000;

app.get("/", middleware, (req, res) => {
  res.json({
    message: "Claims extracted successfully",
    claims: req.claims,
    headers: req.headers
  });
});

app.listen(port, () => {
  console.log(`Express service listening at http://localhost:${port}`);
});
