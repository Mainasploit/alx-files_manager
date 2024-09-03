#!/usr/bin/node

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Secure password hashing using bcrypt
export const pwdHashed = async (pwd) => {
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hash = await bcrypt.hash(pwd, salt); // Hash the password
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error.message);
    throw error;
  }
};

// Get the authorization header from the request
export const getAuthzHeader = (req) => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  return header;
};

// Extract the token from the authorization header
export const getToken = (authzHeader) => {
  if (!authzHeader.startsWith('Basic ')) {
    return null;
  }
  return authzHeader.substring(6).trim();
};

// Decode the base64 encoded token
export const decodeToken = (token) => {
  try {
    const decodedToken = Buffer.from(token, 'base64').toString('utf8');
    if (!decodedToken.includes(':')) {
      return null;
    }
    return decodedToken;
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
};

// Extract email and password from the decoded token
export const getCredentials = (decodedToken) => {
  const [email, password] = decodedToken.split(':');
  if (!email || !password) {
    return null;
  }
  return { email, password };
};
