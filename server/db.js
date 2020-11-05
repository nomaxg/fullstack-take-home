/*
Database query pooler
*/
const { Pool } = require('pg');

const config = {
  user: 'admin',
  password: 'password',
  host: 'localhost',
  database: 'course-db',
  port: 5560,
};

const pool = new Pool(config);

module.exports = pool;
