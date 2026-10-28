import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import MitraNavbar from './MitraNavbar';
import WelcomeHero from './WelcomeHero';
import StatCard from './StatCard';
import StatusMakanan from './StatusMakanan';
import PanduanKelayakan from './PanduanKelayakan';
import PengajuanPenerima from './PengajuanPenerima';
import KatalogMakanan from './KatalogMakanan';
import { colors } from '../theme';

// baca data Mitra yang lagi login (disimpan oleh Login.jsx)
function bacaSession() {
  try {
    return JSON.parse(localStorage.getItem('surplus_session') || 'null');
  } catch {
    return null;
  }
}

// baca array dari localStorage, aman dari error
function bacaList(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const samaNama = (a, b) =>
  String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

export default function DashboardMitra() {
  const [session] = useState(bacaSession);
  const [activePage, setActivePage] = useState('home');

  // belum login atau bukan Mitra -> balik ke halaman login
  if (!session || session.role !== 'mitra') {
    return <Navigate to="/login" replace />;
  }

  const namaMitra = session.namaUsaha || session.nama;

  // halaman Pengajuan dan Katalog dibuat selebar layar
  const selebarLayar = activePage === 'pengajuan' || activePage === 'makanan';

  // ---------- data asli dari localStorage (dibaca ulang tiap pindah menu) ----------
  const makananMitra = bacaList('surplus_makanan').filter((m) => samaNama(m.restoran, namaMitra));
  const klaimMitra = bacaList('surplus_klaim').filter((k) => samaNama(k.restoran, namaMitra));

  const klaimSelesai = klaimMitra.filter((k) => k.status === 'Selesai');
  const klaimBerjalan = klaimMitra.filter((k) => k.status !== 'Selesai');

  const totalPendapatan = klaimSelesai.reduce(
    (total, k) => total + Number(k.harga || 0) * Number(k.jumlah || 1),
    0
  );

  // makanan dianggap "disalurkan" kalau ada klaim Selesai dengan nama makanan yang sama
  const daftarMakanan = makananMitra
    .map((m) => ({
      id: m.id,
      nama: m.makanan,
      porsi: m.porsi,
      status: klaimSelesai.some((k) => samaNama(k.makanan, m.makanan)) ? 'disalurkan' : 'menunggu',
      foto: m.gambar || null
    }))
    .reverse()
    .slice(0, 5); // 5 makanan terbaru biar panel nggak kepanjangan

  const stats = [
    { icon: 'package', label: 'Makanan Dibagikan', value: `${makananMitra.length} Item`, color: '#94a3b8' },
    { icon: 'clock', label: 'Sedang Tersalurkan', value: `${klaimBerjalan.length} Item`, color: '#f59e0b' },
    { icon: 'checkCircle', label: 'Sudah Tersalurkan', value: `${klaimSelesai.length} Item`, color: '#22c55e' },
    {
      icon: 'dollar',
      label: 'Total Pendapatan',
      value: `Rp ${totalPendapatan.toLocaleString('id-ID')}`,
      color: '#22c55e'
    }
  ];

  const pageStyle = {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    backgroundColor: colors.bg,
    color: colors.text,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  };

  const mainStyle = {
    flex: 1,
    padding: selebarLayar ? '28px 0 0' : '28px 30px',
    maxWidth: selebarLayar ? 'none' : '1200px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box'
  };

  const statGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  };

  const panelGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '16px',
    alignItems: 'start'
  };

  const footerStyle = {
    textAlign: 'center',
    padding: '18px',
    backgroundColor: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    color: colors.muted,
    fontSize: '0.9rem'
  };

  return (
    <div style={pageStyle}>
      <MitraNavbar activePage={activePage} setActivePage={setActivePage} namaMitra={namaMitra} />

      <main style={mainStyle}>
        {activePage === 'home' && (
          <>
            <WelcomeHero namaMitra={namaMitra} onBagikan={() => setActivePage('makanan')} />

            <div style={statGrid}>
              {stats.map((item) => (
                <StatCard
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  color={item.color}
                />
              ))}
            </div>

            <div style={panelGrid}>
              <StatusMakanan daftarMakanan={daftarMakanan} />
              <PanduanKelayakan />
            </div>
          </>
        )}
        {activePage === 'makanan' && <KatalogMakanan namaMitra={namaMitra} />}
        {activePage === 'pengajuan' && <PengajuanPenerima namaMitra={namaMitra} />}
        {activePage === 'laporan' && <p>Laporan (isi menyusul)</p>}
      </main>

      <footer style={footerStyle}>© 2026 Surplus – Platform Distribusi Makanan Berlebih.</footer>
    </div>
  );
}