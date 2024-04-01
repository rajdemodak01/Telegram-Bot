const express = require("express");
require("dotenv").config();
const bot = require("./bot");
const app = express();
const port = 3000;

app.use(express.json());
app.post("*", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
app.get("*", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
