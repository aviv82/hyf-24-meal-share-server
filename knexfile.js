module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./database/mealShareDB.sqlite3",
    },
    useNullAsDefault: true,
  },
};
