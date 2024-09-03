#!/usr/bin/node

const { decodeToken, getCredentials, getAuthzHeader, getToken, pwdHashed } = require('../utils/utils');
const redisClient = require('../utils/redis');
const { v4: generateUUID } = require('uuid');
const dbClient = require('../utils/db');

class AuthController {
  static async initiateConnection(req, res) {
    const authorizationHeader = getAuthzHeader(req);
    if (!authorizationHeader) {
      return res.status(401).json({ error: 'Unauthorized Access - Missing Authorization Header' }).end();
    }

    const authToken = getToken(authorizationHeader);
    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized Access - Missing Token' }).end();
    }

    const decodedToken = decodeToken(authToken);
    if (!decodedToken) {
      return res.status(401).json({ error: 'Unauthorized Access - Invalid Token' }).end();
    }

    const { email, password } = getCredentials(decodedToken);
    const user = await dbClient.getUser(email);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized Access - User Not Found' }).end();
    }

    if (user.password !== pwdHashed(password)) {
      return res.status(401).json({ error: 'Unauthorized Access - Incorrect Password' }).end();
    }

    const sessionToken = generateUUID();
    await redisClient.set(`auth_${sessionToken}`, user._id.toString('utf8'), 60 * 60 * 24);
    res.status(200).json({ token: sessionToken, message: 'Connection established successfully' }).end();
  }

  static async terminateConnection(req, res) {
    const authToken = req.headers['x-token'];
    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized Access - Missing Token' }).end();
    }

    const userId = await redisClient.get(`auth_${authToken}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized Access - Invalid Token' }).end();
    }

    const user = await dbClient.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized Access - User Not Found' }).end();
    }

    await redisClient.del(`auth_${authToken}`);
    res.status(204).json({ message: 'Connection terminated successfully' }).end();
  }

  static async retrieveProfile(req, res) {
    const authToken = req.headers['x-token'];
    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized Access - Missing Token' }).end();
    }

    const userId = await redisClient.get(`auth_${authToken}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized Access - Invalid Token' }).end();
    }

    const user = await dbClient.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized Access - User Not Found' }).end();
    }

    res.status(200).json({ id: user._id, email: user.email, status: 'Profile retrieved successfully' }).end();
  }
}

module.exports = AuthController;
