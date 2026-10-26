import React from 'react';
import Icon from './Icons';
import { colors } from '../theme';

export default function WelcomeHero({ namaMitra, onBagikan }) {
  const heroStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '24px 28px',
    marginBottom: '20px'
  };

  const leftStyle = { display: 'flex', alignItems: 'center', gap: '18px' };

  const iconCircle = {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: `2px solid ${colors.primary}`,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer'
  };

  return (
    <div style={heroStyle}>
      <div style={leftStyle}>
        <div style={iconCircle}>
          <Icon name="heart" size={30} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>
            Selamat Datang, {namaMitra}!
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.muted, fontSize: '0.95rem' }}>
            Pusat kendali aktivitas penyaluran dan laporan distribusi makanan Anda.
          </p>
        </div>
      </div>

      <button style={btnStyle} onClick={onBagikan}>
        <Icon name="plusCircle" size={20} />
        Bagikan Makanan Baru
      </button>
    </div>
  );
}