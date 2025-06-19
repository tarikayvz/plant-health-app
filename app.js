
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { sequelize } = require("./models");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const scheduler = require("./utils/scheduler");

const app = express();


app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/" , async (req,res,next) => {
  res.send("ok")
})

app.use("/api", routes);


app.use(errorHandler);


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

   
    scheduler.startScheduler();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

startServer();

module.exports = app;
