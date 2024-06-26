const express = require("express");
const dbConnect = require("./db/index");
require("dotenv").config();
const bot = require("./bot");
const app = express();
const moment = require("moment-timezone");

moment.tz.setDefault("Asia/Kolkata");
const port = process.env.PORT || 3000;

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
    dbConnect(process.env.MONGODB_URI).then((err) => {
        console.log("Mongodb Database connected successfully");
    });
});
