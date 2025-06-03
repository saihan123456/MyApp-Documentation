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

/**
 * Update user password
 * @param {number} userId - The user ID
 * @param {string} currentPassword - The current password for verification
 * @param {string} newPassword - The new password to set
 * @returns {object} - Result object with success status and message
 */
function updatePassword(userId, currentPassword, newPassword) {
  // Get the user from database
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  // Verify current password
  const passwordValid = bcrypt.compareSync(currentPassword, user.password);
  
  if (!passwordValid) {
    return { success: false, message: 'Current password is incorrect' };
  }
  
  // Hash the new password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  // Update the password in the database
  try {
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, message: 'Failed to update password' };
  }
}

module.exports = {
  verifyCredentials,
  updatePassword
};
