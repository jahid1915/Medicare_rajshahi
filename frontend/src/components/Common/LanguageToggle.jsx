import React from 'react';
import { useLanguage } from '../../i18n';

/**
 * Compact slider/toggle [ EN | বাংলা ]
 * Designed specifically for Niramoy's medical aesthetic:
 * - Extremely compact footprint (~96px × 30px)
 * - Zero page reload
 * - Smooth sliding pill animation
 * - High accessibility (keyboard & touch friendly)
 * - Adapts cleanly to both translucent dark headers and light surfaces
 */
export default function LanguageToggle({ variant = 'nav', className = '' }) {
  const { language, setLanguage } = useLanguage();
  const isBn = language === 'bn';

  const toggleLanguage = () => {
    setLanguage(isBn ? 'en' : 'bn');
  };

  // Determine color scheme based on navbar or dashboard surface
  const isNav = variant === 'nav';

  return (
    <div
      className={`niramoy-lang-toggle ${className}`}
      role="group"
      aria-label="Language selection"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        height: 32,
        padding: '2px',
        borderRadius: '9999px',
        background: isNav ? 'rgba(255, 255, 255, 0.12)' : 'var(--color-bg-muted, #f1f5f9)',
        border: isNav ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid var(--color-border, #e2e8f0)',
        backdropFilter: isNav ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: isNav ? 'blur(10px)' : 'none',
        cursor: 'pointer',
        userSelect: 'none',
        flexShrink: 0
      }}
      onClick={toggleLanguage}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleLanguage();
        }
      }}
      tabIndex={0}
    >
      {/* Sliding Pill Indicator */}
      <div
        style={{
          position: 'absolute',
          top: 2,
          bottom: 2,
          left: isBn ? 'calc(50% + 1px)' : 2,
          width: 'calc(50% - 3px)',
          borderRadius: '9999px',
          background: isNav
            ? 'linear-gradient(135deg, #0d7c6e 0%, #14b8a6 100%)'
            : 'var(--color-primary, #0d7c6e)',
          boxShadow: isNav
            ? '0 2px 8px rgba(13, 124, 110, 0.45)'
            : '0 2px 6px rgba(13, 124, 110, 0.25)',
          transition: 'left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none'
        }}
      />

      {/* EN option */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setLanguage('en'); }}
        aria-pressed={!isBn}
        aria-label="Switch to English"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: '100%',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: '0 4px',
          fontSize: '0.74rem',
          fontWeight: !isBn ? 800 : 500,
          letterSpacing: '0.04em',
          color: !isBn
            ? '#ffffff'
            : (isNav ? 'rgba(255, 255, 255, 0.72)' : 'var(--color-text-secondary, #64748b)'),
          transition: 'color 0.2s ease',
          lineHeight: 1
        }}
      >
        EN
      </button>

      {/* বাংলা option */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setLanguage('bn'); }}
        aria-pressed={isBn}
        aria-label="Switch to বাংলা (Bangla)"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 46,
          height: '100%',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: '0 4px',
          fontSize: '0.74rem',
          fontWeight: isBn ? 800 : 500,
          fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', var(--font-body)",
          color: isBn
            ? '#ffffff'
            : (isNav ? 'rgba(255, 255, 255, 0.72)' : 'var(--color-text-secondary, #64748b)'),
          transition: 'color 0.2s ease',
          lineHeight: 1
        }}
      >
        বাংলা
      </button>
    </div>
  );
}
