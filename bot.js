const TelegramBot = require('node-telegram-bot-api');


const token = process.env.TOKEN;
// Replace 'YOUR_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot(token, { polling: false });

// Handle incoming messages
bot.setWebHook(process.env.DOMAIN + token);
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  console.log(msg);

  // Process the message
  // ...

  // Send a reply
  bot.sendMessage(chatId, `Hello, I am your Telegram bot! ${messageText}`);
});


module.exports = bot