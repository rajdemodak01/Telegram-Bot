const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: false });

let amount = null;
let awaitingAnswer = false;
let questionMessageId = null;
let custom_tag=null;
let prev_msg=null;

// Set webhook
bot.setWebHook(process.env.DOMAIN + token);

// Handle incoming messages
bot.on("message", handleMessage);
bot.on("callback_query", handleCallbackQuery);
bot.on("polling_error", handlePollingError);

function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const caption = msg.caption;
  
  if (awaitingAnswer) {
    return;
  }
  
  if (caption && caption.trim() !== "") {
    const match = caption.match(/₹(\d+(\.\d+)?)/);
    if (match) {
      amount = parseFloat(match[1]);
      console.log(amount);
      sendNextQuestion(chatId);
    } else {
      console.log("No amount found in the input string.");
    }
  } else {
    console.log("Caption is undefined or empty.");
  }
  
  // Respond to different types of messages
  if (text === "/start") {
    bot.sendMessage(chatId, "Hello! I am your Telegram bot.");
  } else if (text === "fuck") {
    bot.sendMessage(chatId, "Fuck off");
  } else if(text==="custom tag"){
    bot.sendMessage(chatId,"Enter the tag");
  }else if(prev_msg==="custom tag"){
    bot.sendMessage(chatId, "Custom Tag Updated");
    custom_tag=text;
  }else if (amount === null) {
    bot.sendMessage(chatId, "Invalid command.");
  }
  prev_msg=text;
}

function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const choice = callbackQuery.data;

  // function(amount,choice);//Rohit write your function here
  console.log(`${amount} and ${choice} have been written to amount.txt`);
  bot.sendMessage(chatId, `${amount} and ${choice} Updated`);
  amount = null;
  awaitingAnswer = false;
  if (questionMessageId) {
    bot.deleteMessage(chatId, questionMessageId)
      .then(() => {
        console.log('Message deleted successfully');
        questionMessageId = null;
      })
      .catch(error => {
        console.error('Error deleting message:', error.message);
      });
  }
  // fs.appendFile("amount.txt", `${amount} ${choice}\n`, (err) => {
  //   if (err) {
  //     console.error("Error writing to file:", err);
  //   } else {
  //   }
  // });
}

function sendNextQuestion(chatId) {
  if (!awaitingAnswer) {
    awaitingAnswer = true;
    const options = [
      [{ text: "Food", callback_data: "food" }],
      [{ text: "Shopping", callback_data: "shopping" }],
      [{ text: `${custom_tag}`, callback_data: `${custom_tag}` }],
    ];
    const question = "Choose one option:";
    bot.sendMessage(chatId, question, { reply_markup: { inline_keyboard: options } })
      .then((message) => {
        questionMessageId = message.message_id; // Save the message ID
      });
  }
}


function handlePollingError(error) {
  console.error(error);
}

module.exports = bot;