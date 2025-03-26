const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URl,
});

pool.connect()
    .then(() => console.log("Server connected to postgres"))
    .catch(err => console.error("Connection error", err));

module.exports = { pool };
