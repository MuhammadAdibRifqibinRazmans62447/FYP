const Pool = require('pg').Pool;

const pool = new Pool({

user:"postgres",
host:"localhost",
database:"FYP",
password:"admin01",
port:5432,






});

module.exports = pool;