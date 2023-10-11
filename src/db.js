//creo un objeto pool
const { Pool } = require("pg")

const pool = new Pool({

  //connectionString: process.env.DATABASE_URL,
  user: process.env.PGSQL_USER,
  host: process.env.PGSQL_HOST,
  password: process.env.PGSQL_PASSWORD,
  port: process.env.PGSQL_PORT,
  database: process.env.PGSQL_DATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;