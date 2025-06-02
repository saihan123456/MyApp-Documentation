const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const Schema = require('./schema');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize database
const db = new Database(path.join(dataDir, 'database.db'));

// Create tables if they don't exist
db.exec(Schema.users);
db.exec(Schema.docs);

module.exports = db;
