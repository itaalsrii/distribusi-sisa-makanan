import React from 'react';
import { colors } from '../theme';

const menus = [
  { key: 'home', label: 'Beranda' },
  { key: 'makanan', label: 'Makanan Saya' },
  { key: 'laporan', label: 'Laporan' },
  { key: 'pengajuan', label: 'Pengajuan Penerima' }
];

export default function MitraNavbar({ activePage, setActivePage, namaMitra }) {
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '14px 30px',
    backgroundColor: colors.surface,
    color: colors.text
  };

  const brandStyle = { display: 'flex', alignItems: 'center', gap: '10px' };

  const logoBox = {
    width: '40px',
    height: '40px',
    backgroundColor: colors.primary,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const menuWrap = { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' };

  const btnStyle = (page) => ({
    background: activePage === page ? colors.primary : 'transparent',
    color: '#fff',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: activePage === page ? 'bold' : 'normal',
    transition: 'background 0.3s'
  });

  const profileStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: colors.surfaceLight,
    padding: '8px 14px',
    borderRadius: '10px',
    marginLeft: '8px',
    fontWeight: 'bold'
  };

  return (
    <nav style={navStyle}>
      <div style={brandStyle}>
        <div style={logoBox}>
          <svg viewBox="0 0 64 64" fill="none" width="28" height="28" aria-hidden="true">
            <path d="M22 6c-3 3-3 6 0 9s3 6 0 9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 4c-3 3-3 6 0 9s3 6 0 9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <path d="M42 6c-3 3-3 6 0 9s3 6 0 9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="29" r="3" fill="#fff" />
            <path d="M13 46a19 19 0 0 1 38 0Z" fill="#fff" />
            <rect x="8" y="49" width="48" height="5" rx="2.5" fill="#fff" />
          </svg>
        </div>
        <h2 style={{ margin: 0, color: colors.primary, fontSize: '1.6rem' }}>Surplus</h2>
      </div>

      <div style={menuWrap}>
        {menus.map((menu) => (
          <button key={menu.key} style={btnStyle(menu.key)} onClick={() => setActivePage(menu.key)}>
            {menu.label}
          </button>
        ))}
        <div style={profileStyle}>
          <svg viewBox="0 0 24 24" fill="#fff" width="24" height="24" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0 14.2a8 8 0 0 1-6-2.7c.04-2 4-3.1 6-3.1s5.96 1.1 6 3.1a8 8 0 0 1-6 2.7z" />
          </svg>
          {namaMitra}
        </div>
      </div>
    </nav>
  );
}