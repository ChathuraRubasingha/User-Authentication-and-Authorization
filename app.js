const express = require("express");
const dotenv = require("dotenv");
const connection = require("./app/utils/database");
const userRoutes = require("./app/routes/userRoutes");

const app = express();
dotenv.config();

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to database");
  }
});

// Parse JSON bodies
app.use(express.json());

// Routes
app.use("/user", userRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
