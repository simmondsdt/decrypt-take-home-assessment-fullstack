import type { CSSProperties } from 'react';

export const headerStyle: CSSProperties = {
  padding: '1rem 2rem 0.75rem',
  background: '#1e3a5f',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const logoStyle: CSSProperties = {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '1.25rem',
};

export const navStyle: CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
};

export const navLinkStyle: CSSProperties = {
  color: '#fff',
};

export const cartBadgeStyle: CSSProperties = {
  position: 'absolute',
  top: -10,
  right: -16,
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  background: '#e74c3c',
  color: '#fff',
  fontSize: 11,
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
  boxSizing: 'border-box',
};

export const mainStyle: CSSProperties = {
  padding: '2rem',
  maxWidth: 1200,
  margin: '0 auto',
};
