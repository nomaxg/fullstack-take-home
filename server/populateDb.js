/*
Script that populates database with the course, section, and session data
in ../data
*/
const axios = require('axios');

const courses = require('../data/courses.json');
const sections = require('../data/course-sections.json');
const sessions = require('../data/course-sessions.json');

const api = axios.create({ baseURL: 'http://localhost:8080' });

async function seedDb() {
  try {
    for (const course of courses) {
      await api.post('/addCourse', course);
    }

    for (const section of sections) {
      await api.post('/addSection', section);
    }

    for (const session of sessions) {
      await api.post('/addSession', session);
    }
    console.log('Database seeded with test data!');
  } catch (e) {
    console.log('Error encountered. Probably because database already contains the test data');
  }
}

seedDb();
