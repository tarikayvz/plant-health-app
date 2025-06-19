
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






async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Server başlatmadan önce veritabanı bağlantısını test edin
async function startServer() {
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.error('❌ Cannot start server without database connection');
    process.exit(1);
  }
  
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();

module.exports = app;
