/*
Helper functions for creating and verifying JWTs (JSON web tokens)
*/
const jwt = require('jsonwebtoken');

const secret = 'YKaoGLiR8rfKwrJyNzZXppLB';

function createSessionToken(userId) {
  return jwt.sign({ userId }, secret, { expiresIn: '2h' });
}

function verifySessionToken(token) {
  return jwt.verify(token, secret);
}

module.exports.createSessionToken = createSessionToken;
module.exports.verifySessionToken = verifySessionToken;
