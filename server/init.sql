CREATE TABLE sections(
  id SERIAL,
  courseId INT,
  nickname VARCHAR(255) NOT NULL,
  dateStart DATE,
  numSignups int DEFAULT 0,
  PRIMARY KEY(id)
);

CREATE TABLE sessions(
  id SERIAL,
  courseId INT,
  sessionNumber INT,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE courses(
  id SERIAL,
  name VARCHAR(255) NOT NULL,
  imgUrl VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE signups(
  id SERIAL,
  userId INT,
  sectionId INT,
  PRIMARY KEY(id)
);

CREATE TABLE users(
  id SERIAL,
  username VARCHAR (255) NOT NULL,
  passwordHash VARCHAR (255) NOT NULL,
  PRIMARY KEY(id)
);
