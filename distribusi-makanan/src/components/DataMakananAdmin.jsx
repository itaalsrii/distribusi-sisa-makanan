import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DataMakananAdmin.css";
import AdminProfile from "./AdminProfile";

const dataAwal = [
  { id: 1, nama: "Ayam penyet", harga: "RP 5000", jumlah: 10, ketersediaan: "18 Porsi", alamat: "Batam Center" },
  { id: 2, nama: "Naspad", harga: "Gratis", jumlah: 5, ketersediaan: "8 porsi", alamat: "Bengkong" },
];

function DashboardMakanan() {
  const [makanan, setMakanan] = useState(dataAwal);
  const [pencarian, setPencarian] = useState("");

  const hasilPencarian = useMemo(() => {
    const keyword = pencarian.toLowerCase().trim();
    if (!keyword) return makanan;
    return makanan.filter((item) =>
      [item.nama, item.harga, String(item.jumlah), item.ketersediaan, item.alamat]
        .some((nilai) => nilai.toLowerCase().includes(keyword))
    );
  }, [makanan, pencarian]);

  const hapusMakanan = (id) => {
    if (window.confirm("Yakin ingin menghapus data makanan ini?")) {
      setMakanan((daftar) => daftar.filter((item) => item.id !== id));
    }
  };

  const editMakanan = (item) => {
    const nama = window.prompt("Nama makanan:", item.nama);
    if (nama === null || !nama.trim()) return;
    const harga = window.prompt("Harga makanan:", item.harga);
    if (harga === null) return;
    const jumlah = window.prompt("Jumlah makanan:", String(item.jumlah));
    if (jumlah === null || !jumlah.trim()) return;
    const ketersediaan = window.prompt("Ketersediaan:", item.ketersediaan);
    if (ketersediaan === null) return;
    const alamat = window.prompt("Alamat:", item.alamat);
    if (alamat === null) return;

    setMakanan((daftar) => daftar.map((data) => data.id === item.id
      ? { ...data, nama: nama.trim(), harga: harga.trim(), jumlah: Number(jumlah) || 0, ketersediaan: ketersediaan.trim(), alamat: alamat.trim() }
      : data
    ));
  };
  const location = useLocation();
  const menu = [
    { label: "Beranda", to: "/admin" },
    { label: "Data Pengguna", to: "/admin/pengguna" },
    { label: "Data Makanan", to: "/admin/makanan" },
    { label: "Laporan", to: "/admin/laporan" },
    ];

  return (
    <div className="makanan-dashboard">
<header className="makanan-navbar">
  <Link className="makanan-brand" to="/admin">
    <span className="makanan-brand-logo" aria-hidden="true">♨</span>
    <span>Surplus</span>
  </Link>

  <nav className="makanan-nav" aria-label="Navigasi admin">
    {menu.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className={`makanan-nav-link ${
          location.pathname === item.to ? "active" : ""
        }`}
      >
        {item.label}
      </Link>
    ))}
  </nav>

<AdminProfile />

</header>
      <main className="makanan-main">
        <section className="makanan-titlebar">
          <div className="makanan-title-icon" aria-hidden="true">▰</div>
          <div>
            <h1>Kelola Data Makanan</h1>
            <p>Kelola data makanan dan serarch</p>
          </div>
        </section>

        <div className="makanan-toolbar">
          <label className="makanan-search">
            <span className="makanan-search-icon" aria-hidden="true">⌕</span>
            <input type="search" placeholder="Search..." value={pencarian}
              onChange={(event) => setPencarian(event.target.value)} aria-label="Cari data makanan" />
          </label>
        </div>

        <section className="makanan-table-panel" aria-label="Tabel data makanan">
          <div className="makanan-table-scroll">
            <table className="makanan-table">
              <thead>
                <tr><th>Nama Makanan</th><th>Harga</th><th>Jumlah</th><th>Ketersediaan</th><th>Alamat</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {hasilPencarian.length ? hasilPencarian.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nama}</td><td>{item.harga}</td><td>{item.jumlah}</td>
                    <td>{item.ketersediaan}</td><td>{item.alamat}</td>
                    <td>
                      <div className="makanan-actions">
                        <button type="button" className="makanan-action-btn" onClick={() => editMakanan(item)} aria-label={`Edit ${item.nama}`} title="Edit">
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9M15 3l6 6M10 14l-1 4 4-1L22 8l-5-5z" /></svg>
                        </button>
                        <button type="button" className="makanan-action-btn" onClick={() => hapusMakanan(item.id)} aria-label={`Hapus ${item.nama}`} title="Hapus">
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 10v8M14 10v8" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="6" className="makanan-empty">Data makanan tidak ditemukan.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <footer className="makanan-footer">© 2026 Surplus - Platform Distribusi Makanan Berlebih.</footer>
    </div>
  );
}

export default DashboardMakanan;
