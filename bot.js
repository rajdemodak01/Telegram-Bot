const { fetchDataOfUser, addNewPayment } = require("./utlis/expenseRouter");

const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: false });

let questionMessageId = null;
// let custom_tag = null;

// Set webhook

try {
    bot.setWebHook(process.env.DOMAIN + token);
} catch (e) {
    console.log("error in web hook", e);
}

const commands = [
    { command: "start", description: "Start the bot" },
    { command: "help", description: "Get help" },
    {
        command: "show_tag_expenses",
        description: "This command will show the expenses by tag",
    },
    {
        command: "show_expenses",
        description: "This command will show your expenses",
    },
];
bot.setMyCommands(commands)
    .then(() => {
        console.log("Commands set successfully");
    })
    .catch((error) => {
        console.error("Error setting commands:", error);
    });

// Handle incoming messages
bot.on("message", handleMessage);
bot.on("callback_query", (callbackQuery) => {
    const data = callbackQuery.data;
    if (data.split("_")[1] === "tag") {
        showTagExpenses(callbackQuery);
    } else {
        handleCallbackQuery(callbackQuery, parseFloat(data.split("_")[1]));
    }
});

bot.on("polling_error", handlePollingError);

function sendUserExpenseDetail(data, chatId) {
    const dataString = `
    *Total Spend *: _${data.totalSpend}_
    *Total Spend Current Month *: _${data.monthlySpend.totalSpend}_
    *Daily Average Spend Current Month *: _${data.monthlySpend.averageSpend.toFixed(
        2
    )}_
    *Total Spend Today *: _${data.dailySpend.totalSpend}_
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
    if (text === "/start" || text === "Start") {
        const firstName = msg.from.first_name;
        const welcomeMessage = `Hello, ${firstName}! Welcome to our Telegram bot. Feel free to explore the available commands.`;
        bot.sendMessage(chatId, welcomeMessage, {
            reply_markup: { remove_keyboard: true },
        });
    } else if (text === "/show_expenses" || text == "Show Expenses") {
        fetchDataOfUser(chatId)
            .then((data) => {
                if (data) {
                    sendUserExpenseDetail(data, chatId);
                } else {
                    bot.sendMessage(
                        chatId,
                        "You don't have any expenses to show",
                        {
                            reply_markup: { remove_keyboard: true },
                        }
                    );
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    } else if (text === "help" || text === "/help") {
        // const commandsKeyboard = [
        //     [{ text: "Start" }],
        //     [{ text: "Show Expenses" }],
        // ];
        // bot.sendMessage(chatId, "Fuck off", {
        //     reply_markup: { keyboard: commandsKeyboard },
        // });
        bot.sendMessage(
            chatId,
            "Simply type the amount you spend and a option for tags will be given, choose one option and the payment will be saved with that tag. Now to show you expenses use the command /show_expenses and to show specific tag expenses use the command /show_tag_expenses.\n\nFor any suggestion or error you find, write to rajgobindadham@gmail.com or rohitt24k@gmail.com"
        );
    } else if (isNumber(text)) {
        sendNextQuestion(chatId, text);
    } else if (caption && caption.trim() !== "") {
        const match = caption.match(/₹(\d+(\.\d+)?)/);
        if (match) {
            sendNextQuestion(chatId, parseFloat(match[1]));
        }
    } else if (text === "show_tag_expenses" || text === "/show_tag_expenses") {
        sendNextQuestion(chatId, "tag");
    } else {
        bot.sendMessage(chatId, "Invalid text.");
    }
}

async function handleCallbackQuery(callbackQuery, amount) {
    const chatId = callbackQuery.message.chat.id;
    const choice = callbackQuery.data.split("_")[0];

    console.log(`${amount} and ${choice}`);
    // bot.sendMessage(chatId, choice);
    bot.sendMessage(chatId, `_${choice}_`, { parse_mode: "Markdown" });

    try {
        const data = await addNewPayment(
            chatId,
            parseFloat(amount),
            choice.toLowerCase()
        );
        sendUserExpenseDetail(data, chatId);
    } catch (error) {
        console.log(error);
        bot.sendMessage(chatId, "there was an error saving this payment");
    }
    amount = null;
    if (questionMessageId) {
        bot.deleteMessage(chatId, questionMessageId)
            .then(() => {
                console.log("Message deleted successfully");
                questionMessageId = null;
            })
            .catch((error) => {
                console.error("Error deleting message:", error.message);
            });
    }
}

async function showTagExpenses(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const choice = callbackQuery.data.split("_")[0];
    console.log(`${choice} - this is showing tag expenses`);
    bot.sendMessage(chatId, `_${choice}_`, { parse_mode: "Markdown" });

    fetchDataOfUser(chatId)
        .then((data) => {
            if (data) {
                sendUserExpenseDetail(
                    data.tagSpend.find(
                        (d) => d.tagName === choice.toLowerCase()
                    ),
                    chatId
                );
            } else {
                bot.sendMessage(chatId, "You don't have any expenses to show");
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });

    if (questionMessageId) {
        bot.deleteMessage(chatId, questionMessageId)
            .then(() => {
                console.log("Message deleted successfully");
                questionMessageId = null;
            })
            .catch((error) => {
                console.error("Error deleting message:", error.message);
            });
    }
}

function sendNextQuestion(chatId, amount) {
    const options = [
        [{ text: "Food", callback_data: `Food_${amount}` }],
        [{ text: "Travel", callback_data: `Travel_${amount}` }],
        [{ text: "Essential", callback_data: `Essential_${amount}` }],
        [{ text: "Education", callback_data: `Education_${amount}` }],
        [{ text: "Others", callback_data: `Others_${amount}` }],
        // [{ text: `${custom_tag}`, callback_data: `${custom_tag}` }],
    ];
    const question = "Choose one option:";
    bot.sendMessage(chatId, question, {
        reply_markup: { inline_keyboard: options },
    }).then((message) => {
        questionMessageId = message.message_id;
    });
}

function handlePollingError(error) {
    console.error(error);
}

module.exports = bot;

// {
//     monthlySpend: { month: '2024-04', totalSpend: 270, averageSpend: 9 },
//     dailySpend: { date: '2024-04-30', totalSpend: 270 },
//     _id: new ObjectId('663080bed17c1e6795f05d35'),
//     username: '5317433410',
//     totalSpend: 270,
//     tagSpend: [
//       {
//         monthlySpend: [Object],
//         dailySpend: [Object],
//         tagName: 'food',
//         totalSpend: 150,
//         _id: new ObjectId('663080bed17c1e6795f05d36')
//       },
//       {
//         monthlySpend: [Object],
//         dailySpend: [Object],
//         tagName: 'travel',
//         totalSpend: 120,
//         _id: new ObjectId('663080bed17c1e6795f05d37')
//       },
//       {
//         monthlySpend: [Object],
//         dailySpend: [Object],
//         tagName: 'essential',
//         totalSpend: 0,
//         _id: new ObjectId('663080bed17c1e6795f05d38')
//       },
//       {
//         monthlySpend: [Object],
//         dailySpend: [Object],
//         tagName: 'education',
//         totalSpend: 0,
//         _id: new ObjectId('663080bed17c1e6795f05d39')
//       },
//       {
//         monthlySpend: [Object],
//         dailySpend: [Object],
//         tagName: 'others',
//         totalSpend: 0,
//         _id: new ObjectId('663080bed17c1e6795f05d3a')
//       }
//     ],
//     __v: 0
//   }
