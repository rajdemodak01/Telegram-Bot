const expenseModel = require("../model/expenseModel");
const moment = require("moment");

function checkIfDateInMonth(oldDate, newDate) {
  function removeDayFromDate(dateString) {
    // Split the date string by the dash "-"
    const parts = dateString.split("-");
    // Join the parts until the second dash
    return parts.slice(0, 2).join("-");
  }
  const newOld = removeDayFromDate(oldDate);
  const newNew = removeDayFromDate(newDate);

  if (newOld === newNew) {
    //   console.log("Payment date is within the current month.");
    return true;
  } else {
    // console.log("Payment date is not within the current month.");
    return false;
  }
}

function checkIfDateToday(oldDate, newDate) {
  if (oldDate === newDate) {
    return true;
  } else {
    return false;
  }
}

async function queryOnData(data, date) {
  //                             YYYY-MM-DD
  // console.log(new Date(date));
  // console.log(new Date());
  // console.log(new Date(data.payments[0].paymentDate));

  const payments = data.payments;

  const newPayments = payments.filter((p) =>
    //                 YYYY-MM-DD       YYYY-MM-DD
    checkIfDateInMonth(p.paymentDate, date)
  );

  const totalSpendCurrentMonth = newPayments.reduce(
    (acc, curr) => acc + curr.paymentAmount,
    0
  );

  function getNumberOfDaysInMonth(dateString) {
    // Split the date string into year and month parts
    const [year, month] = dateString.split("-");
    // Create a new Date object for the first day of the next month
    // (day 0 of the next month will be the last day of the current month)
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    // Return the number of days in the month
    return lastDayOfMonth;
  }

  const totalDaysInMonth = getNumberOfDaysInMonth(date);
  const dailyAverageSpendCurrentMonth =
    totalSpendCurrentMonth / totalDaysInMonth;

  const forDay = newPayments.filter((p) =>
    checkIfDateToday(p.paymentDate, date)
  );
  const totalSpendToday = forDay.reduce(
    (acc, curr) => acc + curr.paymentAmount,
    0
  );
  data.paymentSummary.totalSpendCurrentMonth.amount = totalSpendCurrentMonth;
  data.paymentSummary.totalSpendCurrentMonth.month = date;
  data.paymentSummary.dailyAverageSpendCurrentMonth.amount =
    dailyAverageSpendCurrentMonth;
  data.paymentSummary.dailyAverageSpendCurrentMonth.month = date;
  data.paymentSummary.totalSpendToday.amount = totalSpendToday;
  data.paymentSummary.totalSpendToday.date = date;
}

async function addNewPayment(data, newPayment) {
  newPayment.paymentDate = moment(new Date(newPayment.paymentDate))
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD");

  data.payments.push({
    paymentAmount: newPayment.paymentAmount,
    paymentDate: newPayment.paymentDate,
  });
  data.paymentSummary.totalSpend += newPayment.paymentAmount;
  //                        YYYY-MM-DD
  await queryOnData(data, newPayment.paymentDate);
}

async function fetchDataOfUser(username) {
  try {
    // const result = await expenseModel.aggregate([
    //   { $match: { username } },
    //   {
    //     $unwind: "$payments",
    //   },
    //   {
    //     $match: {
    //       "payments.paymentDate": {
    //         $gte: startOfMonth,
    //         $lte: endOfMonth,
    //       },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       payments: { $push: "$payments" },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       payments: 1,
    //     },
    //   },
    // ]);

    const expenseDocument = await expenseModel.findOne({ username });
    // await addNewPayment(expenseDocument, newPayment);
    // const result = await expenseDocument.save();
    if (expenseDocument) {
      return expenseDocument;
    } else {
      const data = await expenseModel({
        username,
        paymentSummary: {},
        payments: [],
      });
      return data;
    }
  } catch (error) {
    throw error;
  }
}

// router.post("/", (req, res) => {
//   const username = req.body.username;
//   const paymentAmount = req.body.paymentAmount;
//   const paymentDate = req.body.paymentDate;
//   fetchDataOfUser(username)
//     .then(async (data) => {
//       await addNewPayment(data, { paymentAmount, paymentDate });
//       const newData = await data.save();
//       res.json(newData);
//     })
//     .catch((error) => {
//       console.log(error);
//       res.json(error);
//     });
// });

// router.post("/find", (req, res) => {
//   const username = req.body.username;
//   fetchDataOfUser(username)
//     .then(async (data) => {
//       res.json(data);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.json(err);
//     });
// });

module.exports = { fetchDataOfUser, addNewPayment };
