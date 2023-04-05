//creo un objeto pool
const { Pool } = require("pg")

const pool = new Pool({

  //connectionString: process.env.DATABASE_URL,
  user: 'admin',
  host: '192.168.0.62',
  password: 'admin111',
  port: '5432',
  database: 'schooldata',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;