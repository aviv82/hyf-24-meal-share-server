const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const CreateFromSqlString = require("../utils/dateTimeHelpers");
const db = require("../services/dbServices");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/", (req, res, next) => {
  const sql = "SELECT * FROM Reservations ORDER by Id";
  console.log(sql);

  try {
    db.all(sql, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (rows.length === 0) {
        return res.status(404).json({
          message: "no reservations found",
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
    console.error("Error while getting reservations", e.message);
    next(e);
  }
});

router.get("/:id", (req, res, next) => {
  if (!req.params.id || req.params.id <= 0) {
    return res.status(400).json({ error: "Invalid reservation Id" });
  }

  const sql = `SELECT * FROM Reservations WHERE Id = ${req.params.id}`;
  console.log(sql);

  try {
    db.get(sql, (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({
          message: "Reservation not found",
        });
      }
      res.status(200).json({
        message: "success",
        data: row,
      });
    });
  } catch (e) {
    console.error("Error while getting Reservation", e.message);
    next(e);
  }
});

router.post("/", (req, res, next) => {
  if (!req.body.contactPhoneNumber || req.body.contactPhoneNumber === "") {
    return res
      .status(400)
      .json({ error: "New contact phone number must be provided" });
  }

  const data = {
    Id: 0,
    NumberOfGuests: req.body.numberOfGuests,
    ContactPhoneNumber: req.body.contactPhoneNumber,
    ContactName: req.body.contactName,
    CreatedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
    MealId: req.body.mealId,
  };

  const sql = `INSERT INTO Reservations 
  (NumberOfGuests, ContactPhoneNumber, ContactName, CreatedDate, MealId) 
  VALUES ("${data.ContactPhoneNumber}","${data.ContactName}", ${data.NumberOfGuests}, '${data.CreatedDate}', ${data.MealId})`;
  console.log(sql);

  try {
    db.run(sql, function (err, result) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      data.Id = this.lastID;
      res.status(201).json({
        message: "Reservation created",
        data,
      });
    });
  } catch (e) {
    console.error("Error while creating reservation", e.message);
    next(e);
  }
});

module.exports = router;
