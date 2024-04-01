const mongoose = require("mongoose");

const connect = function (uri) {
  return mongoose.connect(uri);
};

module.exports = connect;
