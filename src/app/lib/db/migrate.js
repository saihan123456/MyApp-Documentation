const db = require('./index');
const Schema = require('./schema');

// Run all migrations
function runMigrations() {
  console.log('Running database migrations...');
  
  // Create tables if they don't exist
  Object.keys(Schema).forEach(tableName => {
    console.log(`Ensuring table exists: ${tableName}`);
    db.exec(Schema[tableName]);
  });
  
  // Create uploads directory if it doesn't exist
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  console.log('Migrations completed successfully.');
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
