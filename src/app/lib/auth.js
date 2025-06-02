const bcrypt = require('bcryptjs');
const db = require('./db');

/**
 * Verify user credentials
 * @param {string} username - The username to verify
 * @param {string} password - The password to verify
 * @returns {object|null} - The user object if credentials are valid, null otherwise
 */
function verifyCredentials(username, password) {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user) {
    return null;
  }
  
  const passwordValid = bcrypt.compareSync(password, user.password);
  
  if (!passwordValid) {
    return null;
  }
  
  // Don't return the password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

module.exports = {
  verifyCredentials
};
