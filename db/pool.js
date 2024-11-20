const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

console.log("Database URL (parsed):", connectionString);
console.log("process.env:", process.env);


module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});