//creo un objeto pool
const { Pool } = require("pg")

const pool = new Pool({

  //connectionString: process.env.DATABASE_URL,
  user: 'martin',
  host: 'localhost',
  password: 'admin',
  port: '5432',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;