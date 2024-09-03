#!/usr/bin/node

const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AppController {
  static fetchStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    if (redisAlive && dbAlive) {
      res.status(200).json({ status: 'OK', services: { redis: redisAlive, db: dbAlive } });
    } else {
      res.status(500).json({ status: 'Error', message: 'One or more services are down.' });
    }
  }

  static async retrieveStats(req, res) {
    try {
      const userCount = await dbClient.nbUsers();
      const fileCount = await dbClient.nbFiles();

      res.status(200).json({ users: userCount, files: fileCount, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ status: 'Error', message: 'Unable to fetch statistics.', error });
    }
  }
}

module.exports = AppController;
