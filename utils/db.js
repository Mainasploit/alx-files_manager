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
      await this.connect();
    }
    return this.client.db(this.database).collection(collectionName);
  }

  async nbUsers() {
    const usersCollection = await this.getCollection('users');
    return usersCollection.countDocuments();
  }

  async nbFiles() {
    const filesCollection = await this.getCollection('files');
    return filesCollection.countDocuments();
  }

  async createUser(email, password) {
    const usersCollection = await this.getCollection('users');
    const hashedPwd = pwdHashed(password);
    const result = await usersCollection.insertOne({ email, password: hashedPwd });
    return result;
  }

  async getUser(email) {
    const usersCollection = await this.getCollection('users');
    return usersCollection.findOne({ email });
  }

  async getUserById(id) {
    const usersCollection = await this.getCollection('users');
    return usersCollection.findOne({ _id: new ObjectId(id) });
  }

  async userExist(email) {
    const user = await this.getUser(email);
    return !!user;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
