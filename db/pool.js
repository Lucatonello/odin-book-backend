const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});
