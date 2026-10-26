import React from 'react';
import Icon from './Icons';
import { colors } from '../theme';

export default function StatCard({ icon, label, value, color }) {
  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '14px',
    padding: '16px 18px'
  };

  const iconBox = {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: `${color}26`,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  return (
    <div style={cardStyle}>
      <div style={iconBox}>
        <Icon name={icon} size={22} />
      </div>
      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.9rem', color: colors.muted, marginTop: '2px' }}>{value}</div>
      </div>
    </div>
  );
}