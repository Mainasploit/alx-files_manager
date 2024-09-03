#!/usr/bin/node

const { createClient } = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => {
      console.error('Redis error:', err.message);
      this.connected = false;
    });
    this.client.on('connect', () => {
      console.log('Redis connected');
      this.connected = true;
    });
    this.client.on('end', () => {
      console.log('Redis disconnected');
      this.connected = false;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    try {
      const getAsync = promisify(this.client.get).bind(this.client);
      const value = await getAsync(key);
      return value;
    } catch (err) {
      console.error('Redis GET error:', err.message);
      throw err;
    }
  }

  async set(key, value, duration) {
    try {
      const setAsync = promisify(this.client.set).bind(this.client);
      await setAsync(key, value, 'EX', duration);
    } catch (err) {
      console.error('Redis SET error:', err.message);
      throw err;
    }
  }

  async del(key) {
    try {
      const delAsync = promisify(this.client.del).bind(this.client);
      await delAsync(key);
    } catch (err) {
      console.error('Redis DEL error:', err.message);
      throw err;
    }
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
