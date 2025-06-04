const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/mealShareDB.sqlite3", (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log("database connected");
  }
});

module.exports = db;
