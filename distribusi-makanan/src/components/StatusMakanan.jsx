import React from 'react';
import Icon from './Icons';
import { colors } from '../theme';

const statusStyle = {
  menunggu: {
    label: 'Menunggu Pengambilan',
    color: colors.warning,
    background: 'rgba(245, 158, 11, 0.12)'
  },
  disalurkan: {
    label: 'Sudah Disalurkan',
    color: colors.success,
    background: 'rgba(34, 197, 94, 0.12)'
  }
};

export default function StatusMakanan({ daftarMakanan }) {
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
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    padding: '12px 0',
    borderTop: `1px solid ${colors.border}`
  };

  const fotoBox = {
    width: '52px',
    height: '52px',
    borderRadius: '10px',
    backgroundColor: colors.surfaceLight,
    color: colors.muted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0
  };

  const badgeStyle = (status) => ({
    color: statusStyle[status].color,
    backgroundColor: statusStyle[status].background,
    border: `1px solid ${statusStyle[status].color}`,
    borderRadius: '999px',
    padding: '5px 12px',
    fontSize: '0.8rem',
    fontWeight: 600,
    whiteSpace: 'nowrap'
  });

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <div style={headerIcon}>
          <Icon name="clipboard" size={22} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Status Makanan Anda</h3>
          <p style={{ margin: '2px 0 0', color: colors.muted, fontSize: '0.9rem' }}>
            Daftar makanan yang sedang dalam proses penyaluran.
          </p>
        </div>
      </div>

      {daftarMakanan.length === 0 && (
        <p style={{ color: colors.muted, margin: 0 }}>Belum ada makanan yang dibagikan.</p>
      )}

      {daftarMakanan.map((item) => (
        <div key={item.id} style={rowStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <div style={fotoBox}>
              {item.foto ? (
                <img
                  src={item.foto}
                  alt={item.nama}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Icon name="image" size={22} />
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{item.nama}</div>
              <div style={{ color: colors.muted, fontSize: '0.9rem' }}>{item.porsi} Porsi</div>
            </div>
          </div>

          <span style={badgeStyle(item.status)}>{statusStyle[item.status].label}</span>
        </div>
      ))}
    </div>
  );
}