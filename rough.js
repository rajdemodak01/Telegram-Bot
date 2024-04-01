const moment = require("moment-timezone");

// Unix timestamp
let timestamp = 1711998007;

// Convert timestamp to milliseconds
let date = new Date(timestamp * 1000);
let date1 = new Date();
// Convert to a specific time zone (for example, 'America/New_York')
let formattedDate = moment(date)
  .tz("Asia/Kolkata")
  .format("DD-MM-YYYY HH:mm:ss");
let formattedDate1 = moment(date1)
  .tz("Asia/Kolkata")
  .format("DD-MM-YYYY HH:mm:ss");

console.log("Readable Date in Asia/Kolkata time zone:", formattedDate);
console.log("Readable Date in Asia/Kolkata time zone:", formattedDate1);
