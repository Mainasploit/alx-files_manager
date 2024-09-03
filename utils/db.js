#!/usr/bin/node

const { MongoClient, ObjectId } = require('mongodb');
const { pwdHashed } = require('./utils');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.dbUrl = `mongodb://${host}:${port}`;
    this.client = new MongoClient(this.dbUrl, { useUnifiedTopology: true });
    this.connected = false;
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log('Database connected successfully');
    } catch (err) {
      console.error('Database connection error:', err.message);
    }
  }

  isAlive() {
    return this.connected;
  }

  async getCollection(collectionName) {
    if (!this.isAlive()) {
      try {
        await this.connect();
      } catch (err) {
        console.error('Failed to reconnect to the database:', err.message);
        throw err;
      }
    }
    return this.client.db(this.database).collection(collectionName);
  }

  async nbUsers() {
    try {
      const usersCollection = await this.getCollection('users');
      return await usersCollection.countDocuments();
    } catch (err) {
      console.error('Error counting users:', err.message);
      throw err;
    }
  }

  async nbFiles() {
    try {
      const filesCollection = await this.getCollection('files');
      return await filesCollection.countDocuments();
    } catch (err) {
      console.error('Error counting files:', err.message);
      throw err;
    }
  }

  async createUser(email, password) {
    try {
      const usersCollection = await this.getCollection('users');
      const hashedPwd = pwdHashed(password);
      const result = await usersCollection.insertOne({ email, password: hashedPwd });
      return result;
    } catch (err) {
      console.error('Error creating user:', err.message);
      throw err;
    }
  }

  async getUser(email) {
    try {
      const usersCollection = await this.getCollection('users');
      return await usersCollection.findOne({ email });
    } catch (err) {
      console.error('Error fetching user by email:', err.message);
      throw err;
    }
  }

  async getUserById(id) {
    try {
      const usersCollection = await this.getCollection('users');
      return await usersCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.error('Error fetching user by ID:', err.message);
      throw err;
    }
  }

  async userExist(email) {
    try {
      const user = await this.getUser(email);
      return !!user;
    } catch (err) {
      console.error('Error checking if user exists:', err.message);
      throw err;
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
