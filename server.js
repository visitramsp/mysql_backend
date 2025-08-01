const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const userRoute = require("./routes/authRoutes");
const connectToDatabase = require("./db");
const path = require("path");

app.use(express.json());
app.use(cors("*"));
app.get("/", (req, res) => {
  res.send("SERVER RUNNING FOR THE POST IS 3000!");
});
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // to get static image for the chrome browser
app.use("/api", userRoute);

// Connect to DB and start the server
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
  });
