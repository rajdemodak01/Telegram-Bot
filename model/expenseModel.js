const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  paymentSummary: {
    totalSpend: {
      type: Number,
      default: 0,
      required: true,
    },
    totalSpendCurrentMonth: {
      amount: {
        type: Number,
        default: 0,
        required: true,
      },
      month: {
        type: String,
        // default: () => {
        //   const now = new Date();
        //   return new Date(now.getFullYear(), now.getMonth(), 1);
        // },
        required: true,
      },
    },
    dailyAverageSpendCurrentMonth: {
      amount: {
        type: Number,
        default: 0,
        required: true,
      },
      month: {
        type: String,
        // default: () => {
        //   const now = new Date();
        //   return new Date(now.getFullYear(), now.getMonth(), 1);
        // },
        required: true,
      },
    },
    totalSpendToday: {
      amount: {
        type: Number,
        default: 0,
        required: true,
      },
      date: {
        type: String,
        // default: () => {
        //   const now = new Date();
        //   return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // },
        required: true,
      },
    },
  },
  payments: [
    {
      paymentAmount: {
        type: Number,
      },
      paymentDate: {
        type: String,
      },
    },
  ],
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
