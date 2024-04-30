const { fetchDataOfUser, addNewPayment } = require("./utlis/expenseRouter");

const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: false });

let amount = null;
// let awaitingAnswer = false;
let questionMessageId = null;
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
    handleCallbackQuery(callbackQuery, amount);
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
    console.log(text);

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
                    // bot.sendMessage(chatId, "These are your expenses.", {
                    //     reply_markup: { remove_keyboard: true },
                    // });
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
    } else if (text === "fuck") {
        const commandsKeyboard = [
            [{ text: "Start" }],
            [{ text: "Show Expenses" }],
        ];
        bot.sendMessage(chatId, "Fuck off", {
            reply_markup: { keyboard: commandsKeyboard },
        });
    } else if (isNumber(text)) {
        console.log(text);
        amount = text;
        sendNextQuestion(chatId);
    } else if (caption && caption.trim() !== "") {
        const match = caption.match(/₹(\d+(\.\d+)?)/);
        if (match) {
            amount = parseFloat(match[1]);
            console.log(amount);
            sendNextQuestion(chatId);
        }
    } else if (amount) {
        bot.sendMessage(chatId, "Set successfully", {
            reply_markup: { remove_keyboard: true },
        });
        try {
            // const d = await fetchDataOfUser(chatId);
            // const data = await d.save();
            const data = await addNewPayment(
                chatId,
                parseFloat(amount),
                text.toLowerCase()
            );
            sendUserExpenseDetail(data, chatId);
        } catch (error) {
            console.log(error);
            bot.sendMessage(chatId, "there was an error saving this payment");
        }
    } else {
        bot.sendMessage(chatId, "Invalid text.");
        // if (questionMessageId) {
        //     bot.deleteMessage(chatId, questionMessageId)
        //         .then(() => {
        //             console.log("Message deleted successfully");
        //             questionMessageId = null;
        //         })
        //         .catch((error) => {
        //             console.error("Error deleting message:", error.message);
        //         });
        // }
    }
}

async function handleCallbackQuery(callbackQuery, amount) {
    const date = callbackQuery.message.date;

    const chatId = callbackQuery.message.chat.id;
    const choice = callbackQuery.data;

    // if(amount===null){
    //   fetchDataOfUser(chatId)
    //     .then((data) => {
    //       if (data) {
    //         sendUserExpenseDetail(data, chatId);
    //       } else {
    //         setTimeout(() => {
    //           bot.sendChatAction(chatId, "typing");
    //           // sendUserExpenseDetail(data, chatId);
    //         }, 2000);
    //       }
    //     })
    //     .catch((error) => {
    //       console.error("Error fetching data:", error);
    //     });
    // }

    // function(amount,choice);//Rohit write your function here
    console.log(`${amount} and ${choice} have been written to amount.txt`);
    bot.sendMessage(chatId, `${amount} and ${choice} Updated`);
    // awaitingAnswer = false;

    try {
        const d = await fetchDataOfUser(chatId);
        await addNewPayment(d, {
            paymentAmount: parseFloat(amount),
            paymentDate: date * 1000,
            paymentTag: choice,
        });
        const data = await d.save();

        sendUserExpenseDetail(data, chatId);
    } catch (error) {
        console.log(error);
        bot.sendMessage(chatId, "there was an error saving this payment");
    }
    // bot.sendMessage(chatId, amount);
    console.log(amount);
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

function sendNextQuestion(chatId) {
    // const options = [
    //     [{ text: "Food", callback_data: "food" }],
    //     [{ text: "Travel", callback_data: "travel" }],
    //     [{ text: "Essential", callback_data: "essential" }],
    //     [{ text: "Others", callback_data: "others" }],
    //     // [{ text: `${custom_tag}`, callback_data: `${custom_tag}` }],
    // ];
    // const question = "Choose one option:";
    // bot.sendMessage(chatId, question, {
    //     reply_markup: { inline_keyboard: options },
    // }).then((message) => {
    //     questionMessageId = message.message_id;
    // });

    const commandsKeyboard = [
        [{ text: "Food" }],
        [{ text: "Travel" }],
        [{ text: "Essential" }],
        [{ text: "Education" }],
        [{ text: "Others" }],
    ];
    bot.sendMessage(chatId, "Choose one option", {
        reply_markup: { keyboard: commandsKeyboard },
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
