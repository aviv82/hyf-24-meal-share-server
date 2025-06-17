const express = require("express");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 3001;
const cors = require("cors");

const mealsRouter = require("./routes/mealsRoutes");
const reservationsRouter = require("./routes/reservationsRoutes");
const reviewsRouter = require("./routes/reviewsRoutes");

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors());
app.options(
  "*any",
  cors({
    methods: ["GET", "HEAD", "OPTIONS", "POST", "PUT"],
    allowedHeaders: [
      "origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "x-client-key",
      "x-client-token",
      "x-client-secret",
      "Authorization",
    ],
  })
);

app.get("/api/", (req, res) => {
  res.json({ message: "ok" });
});

app.use("/api/meals", mealsRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/reviews", reviewsRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(
    err.message ?? "An unexpected error occurred.",
    err.stack ?? []
  );
  res.status(statusCode).json({ message: err.message });
  return;
});

app.listen(port, () => {
  console.log(`Meal Share API Listening at http://localhost:${port}`);
});
