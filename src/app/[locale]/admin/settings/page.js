'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AuthCheck from '@/app/components/auth-check';
import Navbar from '@/app/components/navbar';
import { useTranslations } from '@/app/translations/client';
import Link from 'next/link';

export default function SettingsPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; 
  const t = useTranslations(); 
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
      setError(t.currentPasswordRequired);
      setIsSubmitting(false);
      return;
    }
    
    if (!newPassword) {
      setError(t.newPasswordRequired);
      setIsSubmitting(false);
      return;
    }
    
    if (newPassword.length < 8) {
      setError(t.passwordMinLength);
      setIsSubmitting(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      setIsSubmitting(false);
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
        throw new Error(data.error || t.passwordUpdateFailed);
      }
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success message
      setSuccess(t.passwordUpdateSuccess);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || t.passwordUpdateFailed);
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
            <Link href={`/${locale}/admin`} style={{ marginRight: '1rem' }}>
              &larr; {t.backToDashboard}
            </Link>
            <h1>{t.accountSettingsTitle}</h1>
          </div>
          
          <div style={{ maxWidth: '600px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h2>{t.resetPassword}</h2>
              
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
                  <label htmlFor="currentPassword">{t.currentPassword}</label>
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
                  <label htmlFor="newPassword">{t.newPassword}</label>
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
                    {t.passwordRequirements}
                  </small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">{t.confirmNewPassword}</label>
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
                  {isSubmitting ? t.updating : t.updatePassword}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
