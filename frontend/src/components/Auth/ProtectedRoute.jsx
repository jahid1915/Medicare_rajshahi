import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps protected routes — redirects to /signin if not authenticated.
 * Optionally restricts to specific roles via `roles` prop.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-app-outer, #f0f4f8)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid var(--border-default, #ddd)',
            borderTopColor: 'var(--primary, #0a5394)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-muted, #666)', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the intended destination for post-login redirect
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-app-outer, #f0f4f8)'
      }}>
        <div className="dashboard-card" style={{ maxWidth: 480, textAlign: 'center', padding: 40 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Your role ({user?.role}) does not have permission to access this page.
          </p>
          <a href="/" className="btn btn-primary">Go Home</a>
        </div>
      </div>
    );
  }

  return children;
}
