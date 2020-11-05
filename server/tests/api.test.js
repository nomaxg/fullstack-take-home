// Simple Jest test suite. Covers important application functionality,
// but not the entire API.
//
// The application does not have a test database, so the db is wiped
// before and after the test suite runs. You will have to populate the
// database again after runnning tests.
const request = require('supertest');
const app = require('../app');

const testUsernames = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

describe('Post Endpoints', () => {
  it('should create a new course', async () => {
    const res = await request(app)
      .post('/addCourse')
      .send({
        name: 'TEST COURSE 1',
        description: 'test test test test',
        imgUrl: 'funnyimage.jpeg',
      });
    expect(res.statusCode).toEqual(201);
  });
  it('should create a new section', async () => {
    const res = await request(app)
      .post('/addSection')
      .send({
        nickname: 'TEST SECTION 1',
        dateStart: '2020-10-4',
        courseId: 1,
      });
    expect(res.statusCode).toEqual(201);
  });
  it('should create a new session', async () => {
    const res = await request(app)
      .post('/addSession')
      .send({
        name: 'TEST SESSION 1',
        courseId: 1,
        description: 'description',
        sessionNumber: '1',
      });
    expect(res.statusCode).toEqual(201);
  });
  it('should not be able to create a duplicate course', async () => {
    const res = await request(app)
      .post('/addCourse')
      .send({
        name: 'TEST COURSE 1',
        description: '',
        imgUrl: '',
      });
    expect(res.statusCode).toEqual(409);
  });
  it('should not be able to create a duplicate section', async () => {
    const res = await request(app)
      .post('/addSection')
      .send({
        nickname: 'TEST SECTION 1',
        dateStart: '2020-10-4',
        courseId: 1,
      });
    expect(res.statusCode).toEqual(409);
  });
  it('should not be able to create a duplicate session', async () => {
    const res = await request(app)
      .post('/addSession')
      .send({
        name: 'TEST SESSION 1',
        courseId: 1,
        description: 'description',
        sessionNumber: '1',
      });
    expect(res.statusCode).toEqual(409);
  });
  it('should not be able to create a session for a course that does not exist', async () => {
    const res = await request(app)
      .post('/addSession')
      .send({
        name: 'TEST SESSION 2',
        courseId: 5,
        description: 'description',
        sessionNumber: '1',
      });
    expect(res.statusCode).toEqual(409);
  });
});

describe('Authentication', () => {
  it('should create some users', async () => {
    for (const user of testUsernames) {
      const res = await request(app)
        .post('/register')
        .send({
          username: user,
          password: 'password',
        });
      expect(res.statusCode).toEqual(201);
    }
  });
  it('should login a user if the correct password is provided', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username: '1',
        password: 'password',
      });
    expect(res.statusCode).toEqual(200);
  });
  it('should reject an invalid password', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username: '1',
        password: 'wrong_password',
      });
    expect(res.statusCode).toEqual(401);
  });
  it('should hand back a valid session token after login', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username: '1',
        password: 'password',
      });
    const sessionToken = res.body;
    const res2 = await request(app)
      .post('/authenticate')
      .send(
        sessionToken,
      );
    expect(res2.statusCode).toEqual(200);
  });
});

describe('Actions', () => {
  it('should be able to assign 10 users to a section', async () => {
    for (const username of testUsernames) {
      const res = await request(app)
        .post('/signUp')
        .send({ userId: parseInt(username), sectionId: 1 });
      expect(res.statusCode).toEqual(200);
    }
  });
  it('should not let a user sign up for a section multiple times', async () => {
    const res = await request(app)
      .post('/signUp')
      .send({ userId: 1, sectionId: 1 });
    expect(res.statusCode).toEqual(409);
  });
  it('should not let a user sign up for a full section', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 11,
        password: 'password',
      });
    const res2 = await request(app)
      .post('/signUp')
      .send({ userId: 11, sectionId: 1 });
    expect(res2.statusCode).toEqual(409);
  });
  it('should be able to remove users from a section', async () => {
    for (const username of testUsernames) {
      const res = await request(app)
        .post('/leaveSection')
        .send({ userId: parseInt(username), sectionId: 1 });
      expect(res.statusCode).toEqual(200);
    }
  });
  it('should not be able to remove a user from a section who was not part of it', async () => {
    const res = await request(app)
      .post('/leaveSection')
      .send({ userId: 11, sectionId: 1 });
    expect(res.statusCode).toEqual(409);
  });
});
