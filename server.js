const path = require('path');
const express = require('express');


const app = express();
const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, 'public');

app.use(express.static(static_path));

app.listen(port, () =>
{
  console.log(`Listening on Port: ${port}`);
});
