import React from 'react';
import { colors } from '../theme';

const syarat = [
  'Belum menyentuh batas kadaluarsa/basi',
  'Dikemas dalam keadaan higienis & tertutup rapat',
  'Informasi makanan seperti jenis dan jumlah porsi dicantumkan.',
  'Makanan siap diambil sesuai waktu yang ditentukan'
];

export default function PanduanKelayakan() {
  const panelStyle = {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '22px 24px'
  };

  const headerStyle = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' };

  const headerIcon = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: `1.5px solid ${colors.primary}`,
    color: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '8px 0',
    color: colors.text,
    fontSize: '0.95rem'
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <div style={headerIcon}>
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Panduan Standar Kelayakan</h3>
          <p style={{ margin: '2px 0 0', color: colors.muted, fontSize: '0.9rem' }}>
            Syarat & ketentuan kondisi makanan yang layak salur.
          </p>
        </div>
      </div>

      {syarat.map((teks) => (
        <div key={teks} style={itemStyle}>
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke={colors.success}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: '3px' }}
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{teks}</span>
        </div>
      ))}
    </div>
  );
}