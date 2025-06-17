const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const db = require("../services/dbKnexServices");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const route = "reviews";

router.get("/", async (req, res) => {
  const sql = "SELECT * FROM Reservations ORDER by Id";
  console.log(sql);

  try {
    const rows = await db.getAll(route);
    if (rows.length === 0) {
      return res.status(404).json({
        message: "no reviews found",
        data: rows,
      });
    } else {
      return res.status(200).json({
        message: "success",
        data: rows,
      });
    }
  } catch (e) {
    console.error("Error while getting reviews", e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  if (!req.params.id || req.params.id <= 0) {
    return res.status(400).json({ error: "Invalid review Id" });
  }
  try {
    const review = await db.getById(route, req.params.id);
    review.length > 0
      ? res.status(200).json({
          message: "success",
          review,
        })
      : res.status(404).json({
          message: "Review not found",
        });
  } catch (e) {
    console.error("Error while getting review", e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  if (
    !req.body.stars ||
    req.body.stars === "" ||
    !req.body.title ||
    req.body.title === ""
  ) {
    return res
      .status(400)
      .json({ error: "New title and stars must be provided" });
  }

  req.body.createdDate = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  try {
    const newReview = await db.create(route, req.body);
    newReview
      ? res.status(201).json({
          message: "Review created",
          newReview,
        })
      : res.status(400).json({ error: "New title and stars must be provided" });
  } catch (e) {
    console.error("Error while creating review", e.message);
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  if (!req.params.id || req.params.id <= 0) {
    return res.status(400).json({ error: "Invalid review Id" });
  }

  if (!req.body) {
    return res
      .status(400)
      .json({ error: "Update review request cannot be blank." });
  }

  try {
    const review = await db.getById(route, req.params.id);
    if (review.length == 0) {
      res.status(404).json({
        message: "Review not found",
      });
    } else {
      const updatedReview = await db.update(route, req.params.id, req.body);
      updatedReview
        ? res.status(200).json({
            message: "Review updated",
            updatedReview,
          })
        : res.status(404).json({
            message: "Review not found",
          });
    }
  } catch (e) {
    console.error("Error while updating review", e.message);
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  if (!req.params.id || req.params.id <= 0) {
    return res.status(400).json({ error: "Invalid review Id" });
  }

  try {
    const deletedReview = await db.remove(route, req.params.id);
    deletedReview > 0
      ? res.status(204).json({
          message: "Review deleted",
        })
      : res.status(404).json({
          message: "Review not found",
        });
  } catch (e) {
    console.error("Error while deleting review", e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
