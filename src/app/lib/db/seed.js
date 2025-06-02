const db = require('./index');
const bcrypt = require('bcryptjs');

// Seed the database with initial data
function seedDatabase() {
  console.log('Seeding database...');
  
  try {
    // Check if admin user exists, if not create a default one
    const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    
    if (!adminUser) {
      const hashedPassword = bcrypt.hashSync('admin123', 10); // Default password: admin123
      
      db.prepare('INSERT INTO users (username, password, name) VALUES (?, ?, ?)')
        .run('admin', hashedPassword, 'Administrator');
      
      console.log('Default admin user created');
    }
    
    // Check if we have any documents, if not create a simple getting started document
    const docCount = db.prepare('SELECT COUNT(*) as count FROM docs').get();
    
    if (docCount.count === 0) {
      // Simple getting started document with just a single sentence
      const sampleDoc = {
        title: 'Getting Started',
        slug: 'getting-started',
        content: '# Getting Started with MyApp\n\nWelcome to MyApp! This is a simple documentation system.',
        published: true
      };
      
      // Insert the simple document
      db.prepare('INSERT INTO docs (title, content, slug, published) VALUES (?, ?, ?, ?)')
        .run(sampleDoc.title, sampleDoc.content, sampleDoc.slug, sampleDoc.published ? 1 : 0);
      
      console.log('Simple getting started document created');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();

module.exports = seedDatabase;
