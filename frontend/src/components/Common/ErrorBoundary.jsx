import React from 'react';

/**
 * Robust Error Boundary to prevent white screen of death.
 * Catches unhandled JavaScript render errors and renders a friendly recovery UI.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('⚠️ [Niramoy ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)',
          padding: '24px',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '20px',
            padding: '36px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px -15px rgba(13, 124, 110, 0.15)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(13, 124, 110, 0.1)',
              color: '#0d7c66',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '20px'
            }}>
              🩺
            </div>
            <h1 style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '10px'
            }}>
              Something went wrong / কিছুটা সমস্যা হয়েছে
            </h1>
            <p style={{
              fontSize: '0.92rem',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '28px'
            }}>
              Niramoy encountered an unexpected error while rendering this page. You can safely refresh or return to the main healthcare portal.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 22px',
                  borderRadius: '10px',
                  background: '#0d7c66',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(13, 124, 110, 0.25)',
                  transition: 'background 0.2s ease'
                }}
              >
                Reload Page (পুনরায় লোড)
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '12px 22px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: '#1e293b',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                Go to Homepage (হোমে ফিরে যান)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
