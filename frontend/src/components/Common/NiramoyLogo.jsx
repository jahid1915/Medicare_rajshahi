import React from 'react';

/**
 * NiramoyLogo — The official brand emblem and wordmark for Niramoy.
 * Symbolism:
 * - Interconnected dual-ribbon ribbon forming an 'N'
 * - Integrated vitality heartbeat pulse & healing leaf curve
 * - Radiating teal-to-emerald gradient with specular light accents
 */
export function NiramoyIcon({ size = 36, className = '', glow = true }) {
  const s = typeof size === 'number' ? `${size}px` : size;
  const filterId = `niramoy-glow-${size}`;
  const gradId1 = `niramoy-grad-primary-${size}`;
  const gradId2 = `niramoy-grad-accent-${size}`;
  const gradId3 = `niramoy-grad-bg-${size}`;

  return (
    <div
      className={`niramoy-icon-wrapper ${className}`}
      style={{
        width: s,
        height: s,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: 'block',
          filter: glow ? 'drop-shadow(0 4px 12px rgba(13, 124, 110, 0.28))' : 'none',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <defs>
          {/* Main squircle background gradient */}
          <linearGradient id={gradId3} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a5c51" />
            <stop offset="50%" stopColor="#0d7c6e" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>

          {/* Left Ribbon Gradient (Healing Teal) */}
          <linearGradient id={gradId1} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>

          {/* Vitality Loop Gradient (Emerald to Mint) */}
          <linearGradient id={gradId2} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Squircle App Container */}
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="13"
          fill={`url(#${gradId3})`}
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1.5"
        />

        {/* Ambient Top Inner Highlight Arc */}
        <path
          d="M6 16C6 11 11 6 16 6H32C37 6 42 11 42 16"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* The 'N' Vitality Loop Emblem */}
        {/* Left vertical pillar of the 'N' */}
        <path
          d="M14 34V15C14 13.8954 14.8954 13 16 13C17.1046 13 18 13.8954 18 15V33C18 34.1046 17.1046 35 16 35C14.8954 35 14 34.1046 14 34Z"
          fill={`url(#${gradId1})`}
        />

        {/* Dynamic diagonal pulse ribbon connecting the N with a healthcare heartbeat knot */}
        <path
          d="M16 16.5L24 28.5L27 24L32 33"
          stroke={`url(#${gradId2})`}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right vertical pillar of the 'N' */}
        <path
          d="M30 33V15C30 13.8954 30.8954 13 32 13C33.1046 13 34 13.8954 34 15V33C34 34.1046 33.1046 35 32 35C30.8954 35 30 34.1046 30 33Z"
          fill="white"
        />

        {/* Center Health Star / Healing Pulse Dot */}
        <circle cx="24" cy="18" r="2.75" fill="#5eead4" />
        <circle cx="24" cy="18" r="1.5" fill="#ffffff" />
      </svg>
    </div>
  );
}

export default function NiramoyLogo({
  size = 'md',
  variant = 'default',
  showTagline = true,
  tagline = 'Rajshahi Healthcare',
  className = ''
}) {
  const sizes = {
    sm: { icon: 28, text: '1.05rem', tagline: '9px', gap: 8 },
    md: { icon: 38, text: '1.3rem', tagline: '10px', gap: 10 },
    lg: { icon: 46, text: '1.55rem', tagline: '11px', gap: 12 },
    xl: { icon: 56, text: '1.85rem', tagline: '12px', gap: 14 }
  };

  const config = sizes[size] || sizes.md;
  const isLightText = variant === 'light' || variant === 'white';

  return (
    <div
      className={`niramoy-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: config.gap,
        textDecoration: 'none',
        userSelect: 'none'
      }}
    >
      <NiramoyIcon size={config.icon} />

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: config.text,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: isLightText ? '#ffffff' : 'var(--color-text, #0f172a)',
            display: 'flex',
            alignItems: 'baseline'
          }}
        >
          Niramoy
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isLightText ? '#34d399' : '#10b981',
              marginLeft: 3,
              boxShadow: isLightText ? '0 0 10px rgba(52, 211, 153, 0.9)' : '0 0 8px rgba(16, 185, 129, 0.7)'
            }}
          />
        </div>

        {showTagline && (
          <span
            style={{
              fontSize: config.tagline,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isLightText ? '#a7f3d0' : '#0d7c6e',
              textShadow: isLightText ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
              marginTop: 2
            }}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
