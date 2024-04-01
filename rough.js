function getNumberOfDaysInMonth(dateString) {
  // Split the date string into year and month parts
  const [year, month] = dateString.split("-");
  // Create a new Date object for the first day of the next month
  // (day 0 of the next month will be the last day of the current month)
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  // Return the number of days in the month
  return lastDayOfMonth;
}

// Example usage:
const dateString = "2024-03-22"; // Assuming this is your date in YYYY-MM-DD format
const numberOfDays = getNumberOfDaysInMonth(dateString);

console.log("Number of days in the month:", numberOfDays);
