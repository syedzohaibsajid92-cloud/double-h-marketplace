require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/db");



const PORT = process.env.PORT || 3000;

pool.connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL Database!");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:");
    console.error(err.message);
  });