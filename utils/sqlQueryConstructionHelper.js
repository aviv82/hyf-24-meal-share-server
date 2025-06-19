const SqlQueryConstructionHelper = (baseSql, req) => {
  let sql = baseSql;
  let filterCount = 0;

  if (req.query.availableReservations) {
    sql = `SELECT MealId, Title, Description, Location, MaxReservations, [When], Price, CreatedDate
          FROM (select m.MealId MealId, m.Title Title, m.Description Description, Location Location, MaxReservations MaxReservations, [when] [When], Price Price, m.CreatedDate CreatedDate, COUNT(m.MealId) c 
          FROM Meals m
          JOIN Reservations r on r.MealId = m.MealId 
          GROUP by m.MealId
          HAVING c ${
            req.query.availableReservations === "true" ? "<" : ">"
          } m.MaxReservations)`;
  }

  if (req.query.maxPrice) {
    filterCount++;
    sql = sql + ` WHERE Price < ${req.query.maxPrice}`;
  }

  if (req.query.title) {
    sql =
      sql +
      ` ${filterCount === 0 ? "WHERE" : "AND"} Title LIKE '%${
        req.query.title
      }%'`;
    filterCount++;
  }

  if (req.query.dateAfter) {
    sql =
      sql +
      ` ${filterCount === 0 ? "WHERE" : "AND"} [When] > '${
        req.query.dateAfter
      }'`;
    filterCount++;
  }

  if (req.query.dateBefore) {
    sql =
      sql +
      ` ${filterCount === 0 ? "WHERE" : "AND"} [When] < '${
        req.query.dateBefore
      }'`;
    filterCount++;
  }

  if (req.query.sortKey) {
    sql =
      sql + ` ORDER by [${req.query.sortKey}] ${req.query.sortDir ?? "asc"}`;
  }

  if (req.query.limit) {
    sql = sql + ` LIMIT ${req.query.limit}`;
  }

  return sql;
};

module.exports = SqlQueryConstructionHelper;
