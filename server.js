#!/usr/bin/node

const express = require('express');
const routes = require('./routes/index');

const appServer = express();
const SERVER_PORT = process.env.PORT ? process.env.PORT : 5000;

appServer.use(express.json());
appServer.use(routes);

appServer.listen(SERVER_PORT, () =>
  console.log(`Maina's server is up and running on port: ${SERVER_PORT}`)
);
