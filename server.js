// npm install pushstate-server
// node server.js

// Defines
const PORT = 8080;
const DIR = './';

// Create server
var server = require('pushstate-server');

// Start server
server.start({
  port: PORT,
  directory: DIR
});
