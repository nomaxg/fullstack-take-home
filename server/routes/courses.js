/*
Routes that handle courses, sessions, and section signups.
*/
const express = require('express');

const asyncHandler = require('express-async-handler');

const router = express.Router();
const pool = require('../db.js');

const SESSION_LIMIT = 10;

// Returns all courses
router.get('/courses', asyncHandler(async (_, res) => {
  const courses = await pool.query('SELECT * FROM courses');
  return res.json(courses.rows);
}));

// Returns the course with the provided ID
router.get('/course/:courseId', asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const courses = await pool.query('SELECT * FROM courses where id = $1', [courseId]);
  return res.json(courses.rows[0]);
}));

// Returns the session names of the course with the provided ID
router.get('/course/:courseId/sessionNames', asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const sessionsRes = await pool.query('SELECT * from sessions WHERE courseId = $1 ORDER BY sessionNumber',
    [courseId]);
  const sessions = sessionsRes.rows;
  const names = sessions.map((session) => session.name);
  return res.json(names);
}));

// Returns the sections of a course
router.get('/course/:courseId/sections', asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const sections = await pool.query('SELECT * FROM sections WHERE courseId = $1 ORDER BY nickname', [courseId]);
  return res.json(sections.rows);
}));

// Returns the list of signups of a course (across all sections)
router.get('/course/:courseId/signups', asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const signups = await pool.query('SELECT * FROM signups LEFT JOIN sections on signups.sectionId = sections.id WHERE sections.courseId = $1', [courseId]);
  return res.json(signups.rows);
}));

// Returns the list of sessions that have been released for the section with the
// provided ID
router.get('/sessionsReleased/:sectionId', asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const sectionRes = await pool.query('SELECT * from sections WHERE id = $1',
    [sectionId]);

  if (sectionRes.rows.length === 0) {
    // Not sure if 409 is the correct response code in this case!
    return res.status(409).json(`Could not find section with id ${sectionId}`);
  }

  const section = sectionRes.rows[0];
  const dateStart = new Date(section.datestart);
  const courseId = section.courseid;
  const sessionsRes = await pool.query('SELECT * from sessions WHERE courseId = $1 ORDER BY sessionNumber',
    [courseId]);
  const sessions = sessionsRes.rows;

  // Only return the sessions that have been released
  const now = Date.now();
  const weeksElapsed = Math.round((now - dateStart) / (7 * 24 * 60 * 60 * 1000));
  const nReleasedCourses = Math.min(Math.max(0, weeksElapsed), sessions.length);
  return res.json(sessions.slice(0, nReleasedCourses));
}));

// Get the names of the participants of a section
router.get('/section/:sectionId/participants', asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const participants = await pool.query('SELECT username FROM users LEFT JOIN signups on signups.userId= users.id WHERE signups.sectionId= $1', [sectionId]);
  return res.json(participants.rows.map((user) => user.username));
}));

// Leave a section - not currently authenticated against session token
router.post('/leaveSection', asyncHandler(async (req, res) => {
  // TODO real authentication
  const { userId, sectionId } = req.body;
  const section = await pool.query('SELECT * FROM sections WHERE id = $1', [
    sectionId,
  ]);

  const signups = await pool.query('SELECT * FROM signups WHERE sectionId = $1 and userId = $2', [
    sectionId, userId,
  ]);

  if (signups.rows.length !== 1) {
    return res.status(409).json('User is not currently signed up for this section');
  }

  await pool.query('DELETE from signups WHERE id = $1',
    [signups.rows[0].id]);

  // Update number of signups
  const numSignups = section.rows[0].numsignups;
  await pool.query('UPDATE sections SET numSignups = $1 WHERE id = $2',
    [numSignups - 1, sectionId]);

  return res.send('Successfully left section');
}));

// Join a section - not currently authenticated against session token
router.post('/signup', asyncHandler(async (req, res) => {
  // TODO real authentication for signups
  const { userId, sectionId } = req.body;
  const section = await pool.query('SELECT * FROM sections WHERE id = $1', [
    sectionId,
  ]);

  const prevSignup = await pool.query('SELECT * FROM signups WHERE sectionId = $1 and userId = $2', [
    sectionId, userId,
  ]);

  if (prevSignup.rows.length !== 0) {
    return res.status(409).json('User has already signed up for this section');
  }

  const numSignups = section.rows[0].numsignups;

  if (numSignups >= SESSION_LIMIT) {
    return res.status(409).json('Session is full');
  }

  // Create new signup
  await pool.query(
    'INSERT INTO signups (userId, sectionId) VALUES ($1, $2) RETURNING *',
    [userId, sectionId],
  );

  // Update number of signups
  await pool.query('UPDATE sections SET numSignups = $1 WHERE id = $2',
    [numSignups + 1, sectionId]);

  return res.send('Sign-up successful');
}));

// Adds a new course to the database
router.post('/addCourse', asyncHandler(async (req, res) => {
  const { name, description, imgUrl } = req.body;
  const course = await pool.query('SELECT * FROM courses WHERE name = $1', [
    name,
  ]);

  if (course.rows.length > 0) {
    return res.status(409).json('Course already exists!');
  }

  const newCourse = await pool.query(
    'INSERT INTO courses (name, description, imgUrl) VALUES ($1, $2, $3) RETURNING *',
    [name, description, imgUrl],
  );

  res.status(201);
  return res.json(newCourse);
}));

// Adds a new session to the database
router.post('/addSession', asyncHandler(async (req, res) => {
  const {
    courseId, name, description, sessionNumber,
  } = req.body;
  const session = await pool.query('SELECT * FROM sessions WHERE name = $1', [
    name,
  ]);

  if (session.rows.length > 0) {
    return res.status(409).json('Session already exists!');
  }

  const course = await pool.query('SELECT * FROM courses WHERE id = $1', [
    courseId,
  ]);

  if (course.rows.length === 0) {
    return res.status(409).json(`Could not find course with courseId ${courseId}`);
  }

  const newSession = await pool.query(
    'INSERT INTO sessions (name, description, courseId, sessionNumber) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, description, courseId, sessionNumber],
  );

  res.status(201);
  return res.json(newSession);
}));

// Adds a new section to the database
router.post('/addSection', asyncHandler(async (req, res) => {
  const { courseId, nickname, dateStart } = req.body;
  const course = await pool.query('SELECT * FROM courses WHERE id = $1', [
    courseId,
  ]);

  if (course.rows.length === 0) {
    return res.status(409).json(`Could not find course with courseId ${courseId}`);
  }

  const section = await pool.query('SELECT * FROM sections WHERE nickname = $1 AND courseId = $2', [
    nickname,
    courseId,
  ]);

  if (section.rows.length > 0) {
    const courseName = course.rows[0].name;
    return res.status(409).json(`Section with nickname ${nickname} already exists for course ${courseName}`);
  }

  const newSection = await pool.query(
    'INSERT INTO sections (courseId, nickname, dateStart) VALUES ($1, $2, $3) RETURNING *',
    [courseId, nickname, dateStart],
  );

  res.status(201);
  return res.json(newSection);
}));

// Returns the username of the user with the provided ID
router.get('/username/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const users = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (users.rows.length === 0) {
    // Not sure if 409 is the correct response code in this case!
    return res.status(409).json(`Could not find user id ${userId}`);
  }
  const { username } = users.rows[0];
  return res.json(username);
}));

module.exports = router;
