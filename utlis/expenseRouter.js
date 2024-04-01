const expenseModel = require("../model/expenseModel");

function checkIfDateInMonth(d, date) {
  const now = new Date(date);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  const paymentDate = new Date(d);

  if (paymentDate >= startOfMonth && paymentDate <= endOfMonth) {
    //   console.log("Payment date is within the current month.");
    return true;
  } else {
    // console.log("Payment date is not within the current month.");
    return false;
  }
}

function checkIfDateToday(d, date) {
  const now = new Date(date);
  const paymentDate = new Date(d);

  return (
    paymentDate.getDate() === now.getDate() &&
    paymentDate.getMonth() === now.getMonth() &&
    paymentDate.getFullYear() === now.getFullYear()
  );
}

async function queryOnData(data, date) {
  const payments = data.payments;

  const newPayments = payments.filter((p) =>
    checkIfDateInMonth(p.paymentDate, date)
  );

  const totalSpendCurrentMonth = newPayments.reduce(
    (acc, curr) => acc + curr.paymentAmount,
    0
  );

  const totalDaysInMonth = new Date(date).getDate();
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
  data.paymentSummary.totalSpendCurrentMonth.month = new Date(date);
  data.paymentSummary.dailyAverageSpendCurrentMonth.amount =
    dailyAverageSpendCurrentMonth;
  data.paymentSummary.dailyAverageSpendCurrentMonth.month = new Date(date);
  data.paymentSummary.totalSpendToday.amount = totalSpendToday;
  data.paymentSummary.totalSpendToday.date = new Date(date);
}

async function addNewPayment(data, newPayment) {
  // newPayment = {paymentAmount:100, paymentDate:"2024-03-05T00:00:00.000Z"}
  data.payments.push(newPayment);
  data.paymentSummary.totalSpend += newPayment.paymentAmount;
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
