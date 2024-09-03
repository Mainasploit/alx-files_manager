#!/usr/bin/node

const AuthController = require('../controllers/AuthController');
const UsersController = require('../controllers/UsersController');
const express = require('express');
const AppController = require('../controllers/AppController');

const router = express.Router();

// Health check and system status
router.get('/health', AppController.getStatus);  // Changed route from /status to /health
router.get('/system-stats', AppController.getStats);  // Changed route from /stats to /system-stats

// User management routes
router.post('/register', UsersController.registerUser);  // Changed route from /users to /register

// Authentication routes
router.post('/login', AuthController.getConnect);  // Changed route from /connect to /login
router.post('/logout', AuthController.getDisconnect);  // Changed route from /disconnect to /logout

// User profile routes
router.get('/profile', AuthController.getMe);  // Changed route from /users/me to /profile

module.exports = router;
