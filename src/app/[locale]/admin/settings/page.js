'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthCheck from '../../components/auth-check';
import Navbar from '../../components/navbar';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate input
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success message
      setSuccess(data.message || 'Password updated successfully');
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'An error occurred while resetting password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCheck>
      <div>
        <Navbar />
        
        <div className="container" style={{ padding: '2rem 0', paddingTop: 'var(--navbar-height, 70px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <Link href="/admin" style={{ marginRight: '1rem' }}>
              &larr; Back to Dashboard
            </Link>
            <h1>Account Settings</h1>
          </div>
          
          <div style={{ maxWidth: '600px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h2>Reset Password</h2>
              
              {error && (
                <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmitting}
                    minLength={8}
                    required
                  />
                  <small className="form-text text-muted">
                    Password must be at least 8 characters long
                  </small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn"
                  style={{ marginTop: '1rem' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
