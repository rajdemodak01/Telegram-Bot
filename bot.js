const { fetchDataOfUser, addNewPayment } = require("./utlis/expenseRouter");

const TelegramBot = require("node-telegram-bot-api");
// const fs = require("fs");

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: false });

let amount = null;
// let awaitingAnswer = false;
// let questionMessageId = null;
// let custom_tag = null;
// let prev_msg = null;

// Set webhook
bot.setWebHook(process.env.DOMAIN + token);
const commands = [
  // { command: "start", description: "Start the bot" },
  // { command: "help", description: "Get help" },
  {
    command: "show_expenses",
    description: "This command will show your expenses",
  },
];
bot
  .setMyCommands(commands)
  .then(() => {
    console.log("Commands set successfully");
  })
  .catch((error) => {
    console.error("Error setting commands:", error);
  });

// Handle incoming messages
bot.on("message", handleMessage);
// bot.on("callback_query", handleCallbackQuery);
bot.on("polling_error", handlePollingError);

function sendUserExpenseDetail(data, chatId) {
  const dataString = `
    *Total Spend *: _${data.paymentSummary.totalSpend}_
    *Total Spend Current Month *: _${data.paymentSummary.totalSpendCurrentMonth.amount}_
    *Daily Average Spend Current Month *: _${data.paymentSummary.dailyAverageSpendCurrentMonth.amount}_
    *Total Spend Today *: _${data.paymentSummary.totalSpendToday.amount}_
    `;

  bot.sendMessage(chatId, dataString, { parse_mode: "Markdown" });
}

function isNumber(text) {
  return !isNaN(parseFloat(text)) && isFinite(text);
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  const date = msg.date;
  const caption = msg.caption;

  bot.sendChatAction(chatId, "typing");
  //Respond to different types of messages
  if (text === "/start" || text==="Start") {
    const firstName = msg.from.first_name;
    const welcomeMessage = `Hello, ${firstName}! Welcome to our Telegram bot. Feel free to explore the available commands.`;
    // bot.sendMessage(chatId, welcomeMessage);
    bot.sendMessage(chatId, welcomeMessage, { reply_markup: { remove_keyboard: true } });
  } else if (text === "/show_expenses" || text=="Show Expenses") {
    fetchDataOfUser(chatId)
    .then((data) => {
      if (data) {
        sendUserExpenseDetail(data, chatId);
        bot.sendMessage(chatId, 'These are your expenses.', {reply_markup: {remove_keyboard: true}});
      } else {
        setTimeout(() => {
          bot.sendChatAction(chatId, "typing");
          // sendUserExpenseDetail(data, chatId);
        }, 2000);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  } else if (text === "fuck") {
    const commandsKeyboard = [
      [{ text: 'Start' }],
      [{ text: 'Show Expenses'}]
    ];
    bot.sendMessage(chatId, 'Fuck off', { reply_markup: { keyboard: commandsKeyboard } });
  
  } else if (isNumber(text)) {
    console.log(text);
    fetchDataOfUser(chatId)
      .then(async (d) => {
        await addNewPayment(d, {
          paymentAmount: parseFloat(text),
          paymentDate: date * 1000,
        });
        const data = await d.save();

        sendUserExpenseDetail(data, chatId);
      })
      .catch((error) => {
        console.log(error);
        bot.sendMessage(chatId, "there was an error saving this payment");
      });
  } else if (caption && caption.trim() !== "") {
    const match = caption.match(/₹(\d+(\.\d+)?)/);
    if (match) {
      amount = parseFloat(match[1]);
      console.log(amount);
      fetchDataOfUser(chatId)
        .then(async (d) => {
          await addNewPayment(d, {
            paymentAmount: parseFloat(amount),
            paymentDate: date * 1000,
          });
          const data = await d.save();

          sendUserExpenseDetail(data, chatId);
        })
        .catch((error) => {
          console.log(error);
          bot.sendMessage(chatId, "there was an error saving this payment");
        });
      // sendNextQuestion(chatId);
      // bot.sendMessage(chatId, amount);
    }
  } else {
    bot.sendMessage(chatId, "Invalid text.");
  }
}

// function handleCallbackQuery(callbackQuery) {
//   const chatId = callbackQuery.message.chat.id;
//   const choice = callbackQuery.data;

//   // function(amount,choice);//Rohit write your function here
//   console.log(`${amount} and ${choice} have been written to amount.txt`);
//   bot.sendMessage(chatId, `${amount} and ${choice} Updated`);
//   amount = null;
//   awaitingAnswer = false;
//   if (questionMessageId) {
//     bot
//       .deleteMessage(chatId, questionMessageId)
//       .then(() => {
//         console.log("Message deleted successfully");
//         questionMessageId = null;
//       })
//       .catch((error) => {
//         console.error("Error deleting message:", error.message);
//       });
//   }
// fs.appendFile("amount.txt", `${amount} ${choice}\n`, (err) => {
//   if (err) {
//     console.error("Error writing to file:", err);
//   } else {
//   }
// });
// }

// function sendNextQuestion(chatId) {
//   if (!awaitingAnswer) {
//     awaitingAnswer = true;
//     const options = [
//       [{ text: "Food", callback_data: "food" }],
//       [{ text: "Shopping", callback_data: "shopping" }],
//       [{ text: `${custom_tag}`, callback_data: `${custom_tag}` }],
//     ];
//     const question = "Choose one option:";
//     bot.sendMessage(chatId, question, { reply_markup: { inline_keyboard: options } })
//       .then((message) => {
//         questionMessageId = message.message_id; // Save the message ID
//       });
//   }
// }

function handlePollingError(error) {
  console.error(error);
}

module.exports = bot;
