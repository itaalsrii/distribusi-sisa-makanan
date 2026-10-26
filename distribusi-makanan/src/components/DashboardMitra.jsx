import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import MitraNavbar from './MitraNavbar';
import WelcomeHero from './WelcomeHero';
import StatCard from './StatCard';
import StatusMakanan from './StatusMakanan';
import PanduanKelayakan from './PanduanKelayakan';
import PengajuanPenerima from './PengajuanPenerima';
import { colors } from '../theme';

// baca data Mitra yang lagi login (disimpan oleh Login.jsx)
function bacaSession() {
  try {
    return JSON.parse(localStorage.getItem('surplus_session') || 'null');
  } catch {
    return null;
  }
}

export default function DashboardMitra() {
  const [session] = useState(bacaSession);
  const [activePage, setActivePage] = useState('home');

  // data sementara, nanti ditambah lewat form upload di menu Katalog Makanan Saya
  // foto: null = belum ada foto, nanti diisi Base64 dari upload mitra
  const [daftarMakanan] = useState([
    { id: 1, nama: 'Mie Ayam', porsi: 5, status: 'menunggu', foto: null },
    { id: 2, nama: 'Kentang Goreng', porsi: 10, status: 'disalurkan', foto: null }
  ]);

  // belum login atau bukan Mitra -> balik ke halaman login
  if (!session || session.role !== 'mitra') {
    return <Navigate to="/login" replace />;
  }

  const namaMitra = session.namaUsaha || session.nama;

  // halaman Pengajuan Penerima dibuat selebar layar
  const selebarLayar = activePage === 'pengajuan';

  const stats = [
    { icon: 'package', label: 'Makanan Dibagikan', value: '24 Item', color: '#94a3b8' },
    { icon: 'clock', label: 'Sedang Tersalurkan', value: '5 Item', color: '#f59e0b' },
    { icon: 'checkCircle', label: 'Sudah Tersalurkan', value: '18 Item', color: '#22c55e' },
    { icon: 'dollar', label: 'Total Pendapatan', value: 'Rp 50.000', color: '#22c55e' }
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
        {activePage === 'makanan' && <p>Katalog Makanan Saya (isi menyusul)</p>}
        {activePage === 'pengajuan' && <PengajuanPenerima namaMitra={namaMitra} />}
        {activePage === 'laporan' && <p>Laporan (isi menyusul)</p>}
      </main>

      <footer style={footerStyle}>© 2026 Surplus – Platform Distribusi Makanan Berlebih.</footer>
    </div>
  );
}