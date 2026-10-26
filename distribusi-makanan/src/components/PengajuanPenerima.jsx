import React, { useState, useEffect } from 'react';
import { colors } from '../theme';

const KEY_KLAIM = 'surplus_klaim';
const OPSI_STATUS = ['Diproses', 'Siap Diambil/Dikirim', 'Selesai'];

const warnaStatus = {
  'Menunggu Konfirmasi': colors.warning,
  Diproses: colors.warning,
  'Siap Diambil/Dikirim': '#60a5fa',
  Selesai: colors.success
};

function bacaKlaim() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY_KLAIM) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const samaNama = (a, b) =>
  String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

// tanggal diambil dari id klaim (Penerima.jsx membuat id = Date.now() + '-' + idMakanan)
function formatTanggal(id) {
  const waktu = parseInt(String(id).split('-')[0], 10);
  if (!waktu) return '-';
  const d = new Date(waktu);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function formatHarga(klaim) {
  const total = Number(klaim.harga || 0) * Number(klaim.jumlah || 1);
  return total === 0 ? 'Gratis' : `Rp ${total.toLocaleString('id-ID')}`;
}

export default function PengajuanPenerima({ namaMitra }) {
  const [semuaKlaim, setSemuaKlaim] = useState(bacaKlaim);

  // update otomatis kalau tab lain (halaman penerima) menambah klaim baru
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY_KLAIM) setSemuaKlaim(bacaKlaim());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // tiap Mitra hanya melihat klaim untuk restorannya sendiri, terbaru di atas
  const klaimMitra = semuaKlaim
    .filter((k) => samaNama(k.restoran, namaMitra))
    .reverse();

  const ubahStatus = (id, statusBaru) => {
    // baca ulang dulu supaya tidak menimpa klaim baru dari tab lain
    const terbaru = bacaKlaim().map((k) => (k.id === id ? { ...k, status: statusBaru } : k));
    localStorage.setItem(KEY_KLAIM, JSON.stringify(terbaru));
    setSemuaKlaim(terbaru);
  };

  const bannerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: colors.surface,
    padding: '28px 60px'
  };

  const sectionStyle = { padding: '32px 60px 40px' };

  const tableCard = {
    backgroundColor: colors.surface,
    borderRadius: '18px',
    padding: '12px 24px 28px',
    minHeight: '380px',
    overflowX: 'auto'
  };

  const tableStyle = {
    width: '100%',
    minWidth: '940px',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'
  };

  const thStyle = {
    textAlign: 'left',
    padding: '24px 14px',
    fontSize: '0.95rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    borderBottom: `2px solid ${colors.bg}`
  };

  const tdStyle = {
    padding: '26px 14px',
    fontSize: '1rem',
    verticalAlign: 'middle',
    lineHeight: 1.5,
    borderBottom: `1px solid ${colors.border}`
  };

  const selectStyle = (status) => ({
    width: '100%',
    maxWidth: '230px',
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    border: `1.5px solid ${warnaStatus[status] || colors.border}`,
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    colorScheme: 'dark'
  });

  return (
    <div>
      <div style={bannerStyle}>
        <svg
          viewBox="0 0 24 24"
          width="68"
          height="68"
          fill="none"
          stroke={colors.primary}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
          <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
          <path d="m2 15 6 6" />
          <path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z" />
        </svg>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
            Kelola Pengajuan Penerima
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.muted, fontSize: '1.1rem' }}>
            Kelola pengajuan dan status penyerahan makanan
          </p>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={tableCard}>
          <table style={tableStyle}>
            <colgroup>
              <col style={{ width: '13%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '18%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={thStyle}>Hari & Tanggal</th>
                <th style={thStyle}>Makanan</th>
                <th style={thStyle}>Penerima</th>
                <th style={thStyle}>Opsi Ambil/Kirim</th>
                <th style={thStyle}>Harga</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {klaimMitra.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      ...tdStyle,
                      borderBottom: 'none',
                      textAlign: 'center',
                      color: colors.muted,
                      padding: '90px 14px'
                    }}
                  >
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: colors.text }}>
                      Belum ada pengajuan
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      Pengajuan dari penerima untuk {namaMitra} akan muncul di sini.
                    </div>
                  </td>
                </tr>
              )}

              {klaimMitra.map((klaim) => {
                // kalau status saat ini belum ada di daftar (misal "Menunggu Konfirmasi"), tampilkan juga
                const opsi = OPSI_STATUS.includes(klaim.status)
                  ? OPSI_STATUS
                  : [klaim.status, ...OPSI_STATUS];

                return (
                  <tr key={klaim.id}>
                    <td style={tdStyle}>{formatTanggal(klaim.id)}</td>
                    <td style={tdStyle}>
                      {klaim.makanan}
                      <div style={{ color: colors.muted, fontSize: '0.9rem' }}>
                        ({klaim.jumlah} porsi)
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div>{klaim.nama}</div>
                      <div style={{ color: colors.muted, fontSize: '0.9rem' }}>{klaim.whatsapp}</div>
                    </td>
                    <td style={tdStyle}>{klaim.metode}</td>
                    <td style={tdStyle}>{formatHarga(klaim)}</td>
                    <td style={tdStyle}>
                      <select
                        style={selectStyle(klaim.status)}
                        value={klaim.status}
                        onChange={(e) => ubahStatus(klaim.id, e.target.value)}
                      >
                        {opsi.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}