const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const CreateFromSqlString = require("../utils/dateTimeHelpers");
const db = require("../services/dbServices");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/", (req, res, next) => {
  try {
    db.all("SELECT * FROM Meals", (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(200).json({
        message: "success",
        data: rows,
      });
    });
  } catch (e) {
    console.error("Error while getting meals", e.message);
    next(e);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    db.get(
      `SELECT * FROM Meals WHERE MealId = ${req.params.id}`,
      (err, row) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        if (!row) {
          res.status(404).json({
            message: "Meal not found",
          });
          return;
        }
        res.status(200).json({
          message: "success",
          data: row,
        });
      }
    );
  } catch (e) {
    console.error("Error while getting Meal", e.message);
    next(e);
  }
});

router.post("/", (req, res, next) => {
  if (!req.body.title || req.body.title === "") {
    res.status(400).json({ error: "New meal title must be provided" });
    return;
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
  console.log("sql", sql);
  try {
    db.run(sql, function (err, result) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
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
    res.status(400).json({ error: "Invalid meal Id" });
    return;
  }

  if (!req.body) {
    res.status(400).json({ error: "Update meal request cannot be blank." });
    return;
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

  console.log("sql", sql);

  try {
    db.run(sql, function (err, result) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      data.MealId = this.lastID;
      res.status(201).json({
        message: "Meal updated",
        data,
      });
    });
  } catch (e) {
    console.error("Error while creating meal", e.message);
    next(e);
  }
});

module.exports = router;
