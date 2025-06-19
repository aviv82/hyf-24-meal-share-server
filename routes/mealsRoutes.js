const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const CreateFromSqlString = require("../utils/dateTimeHelpers");
const db = require("../services/dbServices");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/", (req, res, next) => {
  let sql = "SELECT * FROM Meals";

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

  console.log(sql);

  try {
    db.all(sql, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (rows.length === 0) {
        return res.status(404).json({
          message: "no meals found",
          data: rows,
        });
      } else {
        return res.status(200).json({
          message: "success",
          data: rows,
          totalResults: rows.length,
        });
      }
    });
  } catch (e) {
    console.error("Error while getting meals", e.message);
    next(e);
  }
});

router.get("/by-id/:id", (req, res, next) => {
  if (!req.params.id || req.params.id <= 0) {
    return res.status(400).json({ error: "Invalid meal Id" });
  }

  const sql = `SELECT * FROM Meals WHERE MealId = ${req.params.id}`;
  console.log(sql);

  try {
    db.get(sql, (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({
          message: "Meal not found",
        });
      }
      res.status(200).json({
        message: "success",
        data: row,
      });
    });
  } catch (e) {
    console.error("Error while getting Meal", e.message);
    next(e);
  }
});

router.post("/", (req, res, next) => {
  if (!req.body.title || req.body.title === "") {
    return res.status(400).json({ error: "New meal title must be provided" });
  }

  const data = {
    MealId: 0,
    Title: req.body.title,
    Description: req.body.description,
    Location: req.body.location,
    When: CreateFromSqlString(req.body.when),
    MaxReservations: req.body.maxReservations,
    Price: req.body.price,
    CreatedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  const sql = `INSERT INTO Meals 
  (Title, Description, Location, [When], MaxReservations, Price, CreatedDate) 
  VALUES ("${data.Title}","${data.Description}","${data.Location}",'${data.When}',${data.MaxReservations},${data.Price},'${data.CreatedDate}')`;
  console.log(sql);

  try {
    db.run(sql, function (err, result) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      data.MealId = this.lastID;
      res.status(201).json({
        message: "Meal created",
        data,
      });
    });
  } catch (e) {
    console.error("Error while creating meal", e.message);
    next(e);
  }
});

router.put("/:id", (req, res, next) => {
  if (!req.params.id || req.params.id <= 0) {
    return res.status(400).json({ error: "Invalid meal Id" });
  }

  if (!req.body) {
    return res
      .status(400)
      .json({ error: "Update meal request cannot be blank." });
  }

  const data = {
    Title: req.body.title,
    Description: req.body.description,
    Location: req.body.location,
    When: CreateFromSqlString(req.body.when),
    MaxReservations: req.body.maxReservations,
    Price: req.body.price,
    CreatedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  const sql = `UPDATE Meals SET 
  Title = COALESCE("${data.Title}", Title), 
  Description = COALESCE("${data.Description}", Description), 
  Location = COALESCE("${data.Location}", Location), 
  [When] = COALESCE("${data.When}", [When]), 
  MaxReservations = COALESCE("${data.MaxReservations}", MaxReservations), 
  Price = COALESCE("${data.Price}", Price)
  WHERE MealId = ${req.params.id}`;

  console.log(sql);

  try {
    db.get(
      `SELECT * FROM Meals WHERE MealId = ${req.params.id}`,
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!row) {
          return res.status(404).json({
            message: "Meal not found",
          });
        }
        db.run(sql, function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          data.MealId = this.lastID;
          res.status(200).json({
            message: "Meal updated",
            data,
          });
        });
      }
    );
  } catch (e) {
    console.error("Error while updating meal", e.message);
    next(e);
  }
});

router.delete("/:id", (req, res, next) => {
  if (!req.params.id || req.params.id <= 0) {
    return res.status(400).json({ error: "Meal not found" });
  }

  const selectSql = `SELECT * FROM Meals WHERE MealId = ${req.params.id}`;
  const deleteSql = `DELETE FROM Meals WHERE MealId = ${req.params.id}`;

  try {
    console.log(selectSql);
    db.get(selectSql, (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({
          message: "Meal not found",
        });
      }
      console.log(selectSql);
      db.run(deleteSql, function (err) {
        if (err) {
          return res.status(500).json({ error: res.message });
        }
        return res.status(204).json({
          message: "Meal deleted",
          changes: this.changes,
        });
      });
    });
  } catch (e) {
    console.error("Error while deleting meal", e.message);
    next(e);
  }
});

// node.js week 1 routes

// future-meals

router.get("/future-meals", (req, res, next) => {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  const sql = `SELECT * FROM Meals WHERE [When] > '${now}'`;
  console.log(sql);

  try {
    db.all(sql, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (rows.length === 0) {
        return res.status(404).json({
          message: "no future meals found",
          data: rows,
        });
      } else {
        return res.status(200).json({
          message: "success",
          data: rows,
        });
      }
    });
  } catch (e) {
    console.error("Error while getting meals", e.message);
    next(e);
  }
});

// past-meals

router.get("/past-meals", (req, res, next) => {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  const sql = `SELECT * FROM Meals WHERE [When] < '${now}'`;
  console.log(sql);

  try {
    db.all(sql, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (rows.length === 0) {
        return res.status(404).json({
          message: "no past meals found",
          data: rows,
        });
      } else {
        return res.status(200).json({
          message: "success",
          data: rows,
        });
      }
    });
  } catch (e) {
    console.error("Error while getting meals", e.message);
    next(e);
  }
});

// first meal

router.get("/first-meal", (req, res, next) => {
  const sql = "SELECT * FROM Meals ORDER by MealId ASC LIMIT 1";
  console.log(sql);

  try {
    db.all(sql, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (rows.length === 0) {
        return res.status(404).json({
          message: "no meals found",
          data: rows,
        });
      } else {
        return res.status(200).json({
          message: "success",
          data: rows,
        });
      }
    });
  } catch (e) {
    console.error("Error while getting meals", e.message);
    next(e);
  }
});

// last meal

router.get("/last-meal", (req, res, next) => {
  const sql = "SELECT * FROM Meals ORDER by MealId DESC LIMIT 1";
  console.log(sql);

  try {
    db.all(sql, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (rows.length === 0) {
        return res.status(404).json({
          message: "no meals found",
          data: rows,
        });
      } else {
        return res.status(200).json({
          message: "success",
          data: rows,
        });
      }
    });
  } catch (e) {
    console.error("Error while getting meals", e.message);
    next(e);
  }
});

module.exports = router;
