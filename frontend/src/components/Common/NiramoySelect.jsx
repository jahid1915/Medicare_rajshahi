import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

/**
 * NiramoySelect — Unified Accessible Dropdown Component
 *
 * Supports:
 * - Standard native-enhanced dropdown
 * - Searchable dropdown for large datasets (doctors, specialties, hospitals, areas)
 * - Full keyboard navigation (Enter, Escape, Tab, Arrows)
 * - Screen-reader ARIA tags
 * - Clear hover, focus, disabled, and selected states
 * - Niramoy healthcare design system styling
 */
export default function NiramoySelect({
  label,
  id,
  options = [], // [{ value: '...', label: '...' }] or ['A', 'B']
  value,
  onChange,
  placeholder = 'Select option...',
  disabled = false,
  searchable = false,
  required = false,
  error = '',
  className = '',
  style = {},
  selectStyle = {}
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options to standard format { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.id || opt.name,
        label: opt.label !== undefined ? opt.label : opt.name || String(opt.value)
      };
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Filter options when searchable
  const filteredOptions = searchable && searchQuery.trim()
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : normalizedOptions;

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const selectOption = (opt) => {
    if (disabled) return;
    if (onChange) {
      // Simulate standard event or pass value
      onChange({ target: { value: opt.value, name: selectId } }, opt.value);
    }
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  // If NOT searchable and simple dropdown is desired, we can render the enhanced native select
  if (!searchable) {
    return (
      <div className={`niramoy-select-group ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '5px', ...style }}>
        {label && (
          <label htmlFor={selectId} className="niramoy-select-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text, #1e293b)' }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
        )}
        <div style={{ position: 'relative', width: '100%' }}>
          <select
            id={selectId}
            value={value}
            disabled={disabled}
            required={required}
            onChange={(e) => onChange && onChange(e, e.target.value)}
            className="niramoy-select"
            style={{
              width: '100%',
              height: '42px',
              padding: '8px 36px 8px 14px',
              borderRadius: '12px',
              border: error ? '1.5px solid #ef4444' : '1.5px solid var(--color-border, #cbd5e1)',
              background: disabled ? '#f1f5f9' : '#ffffff',
              color: value ? 'var(--color-text, #0f172a)' : '#94a3b8',
              fontSize: '0.88rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              appearance: 'none',
              WebkitAppearance: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              ...selectStyle
            }}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {normalizedOptions.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: disabled ? '#94a3b8' : 'var(--color-text-muted, #64748b)',
              pointerEvents: 'none'
            }}
          />
        </div>
        {error && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '2px' }}>{error}</span>}
      </div>
    );
  }

  // Searchable custom dropdown
  return (
    <div
      ref={containerRef}
      className={`niramoy-select-group ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative', ...style }}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label htmlFor={selectId} className="niramoy-select-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text, #1e293b)' }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* Select Trigger */}
      <button
        type="button"
        id={selectId}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? selectId : undefined}
        className="niramoy-select-trigger"
        style={{
          width: '100%',
          height: '42px',
          padding: '8px 14px',
          borderRadius: '12px',
          border: error
            ? '1.5px solid #ef4444'
            : isOpen
            ? '1.5px solid var(--color-primary, #0d7c6e)'
            : '1.5px solid var(--color-border, #cbd5e1)',
          background: disabled ? '#f1f5f9' : '#ffffff',
          color: selectedOption ? 'var(--color-text, #0f172a)' : '#94a3b8',
          fontSize: '0.88rem',
          fontWeight: 600,
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(13, 124, 110, 0.12)' : 'none',
          transition: 'all 0.15s ease',
          ...selectStyle
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            color: disabled ? '#94a3b8' : 'var(--color-text-muted, #64748b)',
            flexShrink: 0,
            marginLeft: '8px'
          }}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '12px',
            border: '1.5px solid var(--color-border, #e2e8f0)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            zIndex: 1100,
            overflow: 'hidden',
            animation: 'dropdownFadeIn 0.15s ease-out'
          }}
        >
          {/* Search Box */}
          <div style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 0
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <ul
            ref={listRef}
            role="listbox"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: '4px',
              maxHeight: '220px',
              overflowY: 'auto'
            }}
          >
            {filteredOptions.length === 0 ? (
              <li style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center' }}>
                No options found
              </li>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = selectedOption && String(selectedOption.value) === String(opt.value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectOption(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--color-primary, #0d7c6e)' : '#1e293b',
                      background: isSelected
                        ? 'rgba(13, 124, 110, 0.08)'
                        : isHighlighted
                        ? '#f8fafc'
                        : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.1s ease'
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} style={{ color: 'var(--color-primary, #0d7c6e)', flexShrink: 0 }} />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {error && <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '2px' }}>{error}</span>}
    </div>
  );
}
