const expenseModel = require("../model/expenseModel");
const moment = require("moment-timezone");

function getCurrentDateFormatted() {
    const currentDate = moment.tz(new Date(), "Asia/Kolkata");
    const formattedDate = currentDate.format("YYYY-MM-DD");
    return formattedDate;
}

function extractYearMonthFromDate(dateString) {
    // Assuming dateString is in the format "YYYY-MM-DD"
    return dateString.substring(0, 7); // Extract the first 7 characters (YYYY-MM)
}

function extractYearMonthDayFromDate(dateString) {
    // Assuming dateString is in the format "YYYY-MM-DD"
    const [year, month, day] = dateString.split("-").map(Number);
    return { year, month, day };
}

function handleDateChange(user) {
    const currentDate = getCurrentDateFormatted();
    user.dailySpend.date = currentDate;
    user.dailySpend.totalSpend = 0;

    user.tagSpend.forEach((tag) => {
        (tag.dailySpend.date = currentDate), (tag.dailySpend.totalSpend = 0);
    });

    return user;
}

function handleMonthChange(user) {
    const currentDate = getCurrentDateFormatted();
    user.monthlySpend.month = extractYearMonthFromDate(currentDate);
    (user.monthlySpend.totalSpend = 0), (user.monthlySpend.averageSpend = 0);

    user.tagSpend.forEach((tag) => {
        (tag.monthlySpend.month = extractYearMonthFromDate(currentDate)),
            (tag.monthlySpend.totalSpend = 0),
            (tag.monthlySpend.averageSpend = 0);
    });

    return user;
}

async function addNewPayment(username, paymentAmount, paymentTag) {
    const currentDate = getCurrentDateFormatted();
    let user = await expenseModel.findOne({ username });

    if (!user) {
        user = await createExpense(username);
    }

    //first check if the month in changed

    if (user.monthlySpend.month !== extractYearMonthFromDate(currentDate)) {
        user = handleMonthChange(user);
    }

    //second check if the date in changed

    if (user.dailySpend.date !== currentDate) {
        user = handleDateChange(user);
    }

    user.totalSpend += paymentAmount;
    user.monthlySpend.totalSpend += paymentAmount;
    user.monthlySpend.averageSpend =
        user.totalSpend / extractYearMonthDayFromDate(currentDate).day;

    user.dailySpend.totalSpend += paymentAmount;

    user.tagSpend.forEach((tag) => {
        if (tag.tagName === paymentTag) {
            tag.totalSpend += paymentAmount;
            tag.monthlySpend.totalSpend += paymentAmount;
            tag.monthlySpend.averageSpend =
                tag.totalSpend / extractYearMonthDayFromDate(currentDate).day;

            tag.dailySpend.totalSpend += paymentAmount;
        }
    });

    const data = await user.save();

    return data;
}

async function fetchDataOfUser(username) {
    const user = await expenseModel.findOne({ username });

    return user;
}

async function createExpense(username) {
    const currentDate = getCurrentDateFormatted();
    const user = new expenseModel({
        username: username,
        totalSpend: 0,
        monthlySpend: {
            month: extractYearMonthFromDate(currentDate),
            totalSpend: 0,
            averageSpend: 0,
        },
        dailySpend: {
            date: currentDate,
            totalSpend: 0,
        },
        tagSpend: [
            {
                tagName: "food",
                totalSpend: 0,
                monthlySpend: {
                    month: extractYearMonthFromDate(currentDate),
                    totalSpend: 0,
                    averageSpend: 0,
                },
                dailySpend: {
                    date: currentDate,
                    totalSpend: 0,
                },
            },
            {
                tagName: "travel",
                totalSpend: 0,
                monthlySpend: {
                    month: extractYearMonthFromDate(currentDate),
                    totalSpend: 0,
                    averageSpend: 0,
                },
                dailySpend: {
                    date: currentDate,
                    totalSpend: 0,
                },
            },
            {
                tagName: "essential",
                totalSpend: 0,
                monthlySpend: {
                    month: extractYearMonthFromDate(currentDate),
                    totalSpend: 0,
                    averageSpend: 0,
                },
                dailySpend: {
                    date: currentDate,
                    totalSpend: 0,
                },
            },
            {
                tagName: "education",
                totalSpend: 0,
                monthlySpend: {
                    month: extractYearMonthFromDate(currentDate),
                    totalSpend: 0,
                    averageSpend: 0,
                },
                dailySpend: {
                    date: currentDate,
                    totalSpend: 0,
                },
            },
            {
                tagName: "others",
                totalSpend: 0,
                monthlySpend: {
                    month: extractYearMonthFromDate(currentDate),
                    totalSpend: 0,
                    averageSpend: 0,
                },
                dailySpend: {
                    date: currentDate,
                    totalSpend: 0,
                },
            },
        ],
    });

    return user;
}

module.exports = { addNewPayment, fetchDataOfUser };
