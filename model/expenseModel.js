const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    totalSpend: {
        type: Number,
        default: 0,
    },
    monthlySpend: {
        month: {
            type: String,
        },
        totalSpend: {
            type: Number,
            default: 0,
        },
        averageSpend: {
            type: Number,
            default: 0,
        },
    },
    dailySpend: {
        date: {
            type: String,
        },
        totalSpend: {
            type: Number,
            default: 0,
        },
    },
    tagSpend: [
        {
            tagName: {
                type: String,
            },
            totalSpend: {
                type: Number,
                default: 0,
            },
            monthlySpend: {
                month: {
                    type: String,
                },
                totalSpend: {
                    type: Number,
                    default: 0,
                },
                averageSpend: {
                    type: Number,
                    default: 0,
                },
            },
            dailySpend: {
                date: {
                    type: String,
                },
                totalSpend: {
                    type: Number,
                    default: 0,
                },
            },
        },
    ],
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
