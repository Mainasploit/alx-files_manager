#!/usr/bin/node

const dbClient = require('../utils/db');

class UsersController {
  static async registerUser(req, res) {
    const { userEmail, userPassword } = req.body;

    if (!userEmail) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    if (!userPassword) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    try {
      const doesUserExist = await dbClient.checkIfUserExists(userEmail);

      if (doesUserExist) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      const newUser = await dbClient.addNewUser(userEmail, userPassword);
      const userId = `${newUser.insertedId}`;
      res.status(201).json({ id: userId, email: userEmail });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UsersController;
