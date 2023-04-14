//creo un objeto pool
const { Pool } = require("pg")

const pool = new Pool({

  //connectionString: process.env.DATABASE_URL,
  user: 'admin',
  host: 'localhost',
  password: 'admin111',
  port: '5432',
  database: 'schooldata',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;