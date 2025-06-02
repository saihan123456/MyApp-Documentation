// Database seeding script
const fs = require('fs');
const path = require('path');

console.log('Starting database seeding process...');

// Check if the --reset flag is provided to reset the database
const shouldReset = process.argv.includes('--reset');

// Path to the database file
const dbPath = path.join(process.cwd(), 'data', 'database.db');

// If reset flag is provided and database exists, delete it
if (shouldReset && fs.existsSync(dbPath)) {
  console.log('Resetting database...');
  fs.unlinkSync(dbPath);
  console.log('Database file deleted.');
}

// Import database to ensure tables are created
const db = require('../src/app/lib/db');

// Import and run the seed function
const seedDatabase = require('../src/app/lib/db/seed');
seedDatabase();

console.log('Database seeding completed successfully!');
console.log('\nYou can now access the application with:');
console.log('Username: admin');
console.log('Password: admin123');

