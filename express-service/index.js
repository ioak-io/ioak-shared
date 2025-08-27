const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  console.log('Headers received:', req.headers);
  res.send(req.headers);
});

app.listen(port, () => {
  console.log(`Express service listening at http://localhost:${port}`);
});
