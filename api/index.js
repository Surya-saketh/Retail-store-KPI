// Vercel Serverless Function Entry Point
const app = require('../backend/server-app');
const { initDatabase } = require('../backend/database/init');
const database = require('../backend/database/connection');

// Initialize database on cold start
let dbInitialized = false;

const handler = async (req, res) => {
  // Initialize database if not already done
  if (!dbInitialized) {
    try {
      await initDatabase();
      await database.connect();
      dbInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      // Continue anyway - some endpoints don't need DB
    }
  }
  
  // Handle the request with Express app
  return app(req, res);
};

module.exports = handler;
