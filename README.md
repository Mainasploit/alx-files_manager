# ALX Files Manager

## Project Overview

This project is a comprehensive implementation of back-end technologies and concepts, designed to provide hands-on experience in building a simple file management platform. The primary focus areas include:

- **User Authentication** using tokens
- **File Management** including uploading, listing, and viewing files
- **Background Processing** with Redis and Kue
- **Database Integration** using MongoDB
- **Server-Side Development** using Node.js and Express.js

The project also emphasizes creating APIs, handling authentication, managing data storage, and generating image thumbnails. 

**Team:** Kelvin Maina

## Project Timeline

- **Start Date:** August 29, 2024, 6:00 AM
- **End Date:** September 5, 2024, 6:00 AM
- **Checker Release Date:** August 31, 2024, 12:00 AM
- **Manual QA Review:** Request upon completion
- **Auto Review:** Launched at the deadline

## Learning Objectives

By the end of this project, you should be able to:

- Create an API using Express.js
- Authenticate users with token-based systems
- Store data in MongoDB
- Manage temporary data using Redis
- Set up and use background workers with Kue

## Requirements

- **Allowed Editors:** vi, vim, emacs, Visual Studio Code
- **Environment:** Ubuntu 18.04 LTS, Node.js (version 12.x.x)
- **Code Standards:** Files must end with a new line, use `.js` extension, and pass ESLint checks
- **Mandatory Files:** `README.md` at the root of the project

## Project Structure

### Redis Utilities
Create a `redis.js` file in the `utils` folder that manages Redis operations including:
- Connection handling
- Data retrieval, storage, and deletion

### MongoDB Utilities
Create a `db.js` file in the `utils` folder to handle MongoDB interactions including:
- Database connection
- Counting users and files in collections

### API Development
- **Status and Statistics API:** 
  - GET `/status`: Returns the status of Redis and MongoDB.
  - GET `/stats`: Returns the count of users and files.

- **User Management API:**
  - POST `/users`: Creates a new user with email and password (hashed with SHA1).

- **Authentication API:**
  - GET `/connect`: Authenticates a user and generates a token.
  - GET `/disconnect`: Signs out the user by invalidating the token.
  - GET `/users/me`: Retrieves user information based on the token.

- **File Management API:**
  - POST `/files`: Allows authenticated users to upload files, which are stored locally and documented in MongoDB.

## Provided Files

- `package.json`: Lists project dependencies.
- `.eslintrc.js`: Configuration for ESLint.
- `babel.config.js`: Configuration for Babel.

### Installation

After cloning the repository, make sure to install the necessary dependencies:

```bash
$ npm install
```

## Tasks Breakdown

### Task 0: Redis Utilities
Develop a `RedisClient` class in `utils/redis.js` to handle Redis connections and operations.

### Task 1: MongoDB Utilities
Develop a `DBClient` class in `utils/db.js` to manage MongoDB connections and database operations.

### Task 2: First API
Set up the Express server and create the initial endpoints for checking the status of Redis and MongoDB, as well as retrieving basic statistics.

### Task 3: User Management
Implement user creation functionality, ensuring data security through password hashing.

### Task 4: User Authentication
Develop authentication mechanisms allowing users to log in, generate tokens, and maintain secure sessions.

### Task 5: File Upload
Enable file upload functionality where users can upload files, which are stored both locally and in the MongoDB database.

## Resources

- **Node.js Documentation**
- **Express.js Documentation**
- **Mocha Testing Framework**
- **MongoDB Guide**
- **Redis Documentation**
- **Image Thumbnail Libraries**

## Conclusion

This project is a capstone that brings together all the concepts learned during this back-end trimester. By the end, you will have created a fully functional file management system with robust authentication and data management features. 

**Enjoy the coding journey!**
