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
    
    // Check if we have any documents, if not create three sample documents
    const docCount = db.prepare('SELECT COUNT(*) as count FROM docs').get();
    
    if (docCount.count === 0) {
      // Sample documents to seed the database
      const sampleDocs = [
        {
          title: 'Getting Started',
          slug: 'getting-started',
          content: '# Getting Started with MyApp\n\nWelcome to MyApp! This is a simple documentation system that helps you organize and share information about your application.\n\n## Quick Start\n\n1. Log in to the admin panel\n2. Create your first document\n3. Publish it for your team to see',
          published: true
        },
        {
          title: 'User Guide',
          slug: 'user-guide',
          content: '# User Guide\n\nThis guide will help you understand how to use MyApp effectively.\n\n## Basic Navigation\n\nThe sidebar contains all available documentation pages. Click on any title to view that document.\n\n## Search\n\nUse the search bar at the top to quickly find the information you need across all documentation.',
          published: true
        },
        {
          title: 'FAQ',
          slug: 'faq',
          content: '# Frequently Asked Questions\n\n## General Questions\n\n### What is MyApp?\nMyApp is a simple documentation system designed to help teams share knowledge effectively.\n\n### How do I contribute?\nLog in to the admin panel and create or edit documents.\n\n## Technical Questions\n\n### How is data stored?\nAll documentation is stored in a SQLite database for simplicity and portability.',
          published: true
        }
      ];
      
      // Insert statement
      const insertStmt = db.prepare('INSERT INTO docs (title, content, slug, published) VALUES (?, ?, ?, ?)');
      
      // Insert all sample documents
      for (const doc of sampleDocs) {
        insertStmt.run(doc.title, doc.content, doc.slug, doc.published ? 1 : 0);
      }
      
      console.log('Three sample documents created');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();

module.exports = seedDatabase;
