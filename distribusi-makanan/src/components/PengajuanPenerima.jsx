import React, { useState, useEffect } from 'react';
import { colors } from '../theme';

const KEY_KLAIM = 'surplus_klaim';
const OPSI_STATUS = ['Diproses', 'Siap Diambil/Dikirim', 'Selesai'];

const warnaStatus = {
  'Menunggu Konfirmasi': colors.warning,
  Diproses: colors.warning,
  'Siap Diambil/Dikirim': '#60a5fa',
  Selesai: colors.success,
  Ditolak: colors.primary
};

const warnaPembayaran = {
  'Menunggu Verifikasi': colors.warning,
  Terverifikasi: colors.success,
  Ditolak: colors.primary
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

// klaim lama (sebelum Penerima dipisah) masih pakai field "metode"
const metodeAmbil = (k) => k.metodePengambilan || k.metode || '-';
const metodeBayar = (k) => k.metodePembayaran || (Number(k.harga || 0) === 0 ? 'Gratis' : k.metode || '-');
const perluVerifikasi = (k) => ['QRIS', 'Virtual Account'].includes(metodeBayar(k));

export default function PengajuanPenerima({ namaMitra }) {
  const [semuaKlaim, setSemuaKlaim] = useState(bacaKlaim);
  const [buktiTerbuka, setBuktiTerbuka] = useState(null); // klaim yang buktinya lagi dilihat

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

  // simpan perubahan satu klaim. Baca ulang dulu supaya tidak menimpa klaim baru dari tab lain
  const ubahKlaim = (id, perubahan) => {
    const terbaru = bacaKlaim().map((k) => (k.id === id ? { ...k, ...perubahan } : k));
    localStorage.setItem(KEY_KLAIM, JSON.stringify(terbaru));
    window.dispatchEvent(new Event('surplus-claims-updated'));
    setSemuaKlaim(terbaru);
  };

  const ubahStatus = (id, statusBaru) => ubahKlaim(id, { status: statusBaru });

  const verifikasiPembayaran = (id) => ubahKlaim(id, { statusPembayaran: 'Terverifikasi' });

  // tolak pembayaran = klaim ikut ditolak, jadi stok porsinya otomatis balik di halaman penerima
  const tolakPembayaran = (klaim) => {
    const yakin = window.confirm(
      `Tolak pembayaran dari ${klaim.nama}? Klaim akan dibatalkan dan stok porsi dikembalikan.`
    );
    if (!yakin) return;
    ubahKlaim(klaim.id, { statusPembayaran: 'Ditolak', status: 'Ditolak' });
  };

  // ---------- style ----------
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
    minWidth: '1280px',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'
  };

  const thStyle = {
    textAlign: 'left',
    padding: '24px 12px',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    borderBottom: `2px solid ${colors.bg}`
  };

  const tdStyle = {
    padding: '22px 12px',
    fontSize: '0.95rem',
    verticalAlign: 'top',
    lineHeight: 1.5,
    borderBottom: `1px solid ${colors.border}`,
    wordBreak: 'break-word'
  };

  const mutedKecil = { color: colors.muted, fontSize: '0.88rem' };

  const selectStyle = (status) => ({
    width: '100%',
    maxWidth: '210px',
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    border: `1.5px solid ${warnaStatus[status] || colors.border}`,
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '0.92rem',
    cursor: 'pointer',
    colorScheme: 'dark'
  });

  const pillStyle = (warna) => ({
    display: 'inline-block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: warna,
    border: `1px solid ${warna}`,
    borderRadius: '6px',
    padding: '2px 8px',
    marginTop: '6px'
  });

  const tombolKecil = (warna, isi) => ({
    backgroundColor: isi ? warna : 'transparent',
    color: isi ? '#fff' : warna,
    border: `1.5px solid ${warna}`,
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer'
  });

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: '20px',
    padding: '28px',
    width: '100%',
    maxWidth: '640px',
    maxHeight: '92vh',
    overflowY: 'auto',
    boxSizing: 'border-box'
  };

  const buktiAdalahPdf = buktiTerbuka && String(buktiTerbuka.buktiPembayaran).startsWith('data:application/pdf');

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
            Kelola pengajuan, verifikasi pembayaran, dan status penyerahan makanan
          </p>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={tableCard}>
          <table style={tableStyle}>
            <colgroup>
              <col style={{ width: '9%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '19%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={thStyle}>Hari & Tanggal</th>
                <th style={thStyle}>Makanan</th>
                <th style={thStyle}>Penerima</th>
                <th style={thStyle}>Alamat</th>
                <th style={thStyle}>Pengambilan</th>
                <th style={thStyle}>Pembayaran</th>
                <th style={thStyle}>Harga</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {klaimMitra.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
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
                const ditolak = klaim.status === 'Ditolak';
                const bayar = metodeBayar(klaim);
                const adaVerifikasi = perluVerifikasi(klaim);
                const statusBayar = klaim.statusPembayaran || 'Menunggu Verifikasi';

                // kalau status saat ini belum ada di daftar (misal "Menunggu Konfirmasi"), tampilkan juga
                const opsi = OPSI_STATUS.includes(klaim.status)
                  ? OPSI_STATUS
                  : [klaim.status, ...OPSI_STATUS];

                return (
                  <tr key={klaim.id}>
                    <td style={tdStyle}>{formatTanggal(klaim.id)}</td>

                    <td style={tdStyle}>
                      {klaim.makanan}
                      <div style={mutedKecil}>({klaim.jumlah} porsi)</div>
                    </td>

                    <td style={tdStyle}>
                      <div>{klaim.nama}</div>
                      <div style={mutedKecil}>{klaim.whatsapp}</div>
                    </td>

                    <td style={tdStyle}>{klaim.alamatPenerima || '-'}</td>

                    <td style={tdStyle}>{metodeAmbil(klaim)}</td>

                    <td style={tdStyle}>
                      <div>{bayar}</div>
                      {klaim.bankVA && <div style={mutedKecil}>Bank {klaim.bankVA}</div>}

                      {adaVerifikasi && (
                        <>
                          <span style={pillStyle(warnaPembayaran[statusBayar] || colors.muted)}>
                            {statusBayar}
                          </span>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                            {klaim.buktiPembayaran && (
                              <button
                                type="button"
                                style={tombolKecil('#60a5fa', false)}
                                onClick={() => setBuktiTerbuka(klaim)}
                              >
                                Lihat Bukti
                              </button>
                            )}
                            {statusBayar === 'Menunggu Verifikasi' && (
                              <>
                                <button
                                  type="button"
                                  style={tombolKecil(colors.success, true)}
                                  onClick={() => verifikasiPembayaran(klaim.id)}
                                >
                                  Verifikasi
                                </button>
                                <button
                                  type="button"
                                  style={tombolKecil(colors.primary, false)}
                                  onClick={() => tolakPembayaran(klaim)}
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </td>

                    <td style={tdStyle}>{formatHarga(klaim)}</td>

                    <td style={tdStyle}>
                      {ditolak ? (
                        <span style={{ ...pillStyle(colors.primary), marginTop: 0 }}>Ditolak</span>
                      ) : (
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
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* popup lihat bukti pembayaran */}
      {buktiTerbuka && (
        <div
          style={overlayStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) setBuktiTerbuka(null);
          }}
        >
          <div style={modalStyle}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Bukti Pembayaran</h2>
            <p style={{ margin: '4px 0 18px', color: colors.muted }}>
              {buktiTerbuka.nama} · {buktiTerbuka.makanan} ({buktiTerbuka.jumlah} porsi) ·{' '}
              {formatHarga(buktiTerbuka)}
            </p>

            {buktiAdalahPdf ? (
              <iframe
                title="Bukti pembayaran"
                src={buktiTerbuka.buktiPembayaran}
                style={{ width: '100%', height: '60vh', border: 'none', borderRadius: '12px', backgroundColor: '#fff' }}
              />
            ) : (
              <img
                src={buktiTerbuka.buktiPembayaran}
                alt="Bukti pembayaran"
                style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '12px', backgroundColor: colors.surface }}
              />
            )}

            {buktiTerbuka.namaFileBukti && (
              <p style={{ ...mutedKecil, margin: '10px 0 0' }}>File: {buktiTerbuka.namaFileBukti}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setBuktiTerbuka(null)}
                style={{
                  backgroundColor: '#6b6b70',
                  color: colors.text,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 26px',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}