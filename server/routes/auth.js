/*
Routes that handles user authentication.
*/
const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const { createSessionToken, verifySessionToken } = require('../utils/jwt.js');
const pool = require('../db.js');

const router = express.Router();

const SALT_ROUNDS = 5;

// Registers a new user, returning an authentication token
router.post('/register', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await pool.query('SELECT * FROM users WHERE username = $1', [
    username,
  ]);

  if (user.rows.length > 0) {
    return res.status(409).json('User already exists');
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await pool.query(
    'INSERT INTO users (username, passwordHash) VALUES ($1, $2) RETURNING *',
    [username, passwordHash],
  );

  const sessionToken = createSessionToken(newUser.rows[0].id);

  res.status(201);
  return res.json({ sessionToken });
}));

// Attempts to login a user, returning a session token if the provided password
// matches the hashed password in the database
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const userRes = await pool.query('SELECT * FROM users WHERE username = $1', [
    username,
  ]);

  if (userRes.rows.length === 0) {
    return res.status(409).json('Could not find user');
  }

  const user = userRes.rows[0];
  const isValidPassword = await bcrypt.compare(password, user.passwordhash);

  if (isValidPassword) {
    const sessionToken = createSessionToken(user.id);
    return res.json({ sessionToken });
  }

  return res.status(401).json('User authentication failed');
}));

// Authenticates a session token, returning the id of the authenticated user
router.post('/authenticate', asyncHandler(async (req, res) => {
  const { sessionToken } = req.body;

  try {
    const decoded = verifySessionToken(sessionToken);
    res.json({ userId: decoded.userId });
  } catch (err) {
    res.status(401).json('User authentication failed');
  }
}));

module.exports = router;
