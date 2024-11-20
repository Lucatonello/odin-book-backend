const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

console.log("Database URL (parsed):", connectionString);

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});