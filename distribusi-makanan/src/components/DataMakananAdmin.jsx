
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DataMakananAdmin.css";
import AdminProfile from "./AdminProfile";

const MAKANAN_KEY = "surplus_makanan";

const bacaMakanan = () => {
  try {
    const data = JSON.parse(
      localStorage.getItem(MAKANAN_KEY) || "[]"
    );

    if (!Array.isArray(data)) return [];

    return data.map((item, index) => ({
      ...item,
      id: item.id ?? `makanan-${index}`,
      nama: item.makanan || item.nama || "-",
      harga: Number(item.harga) || 0,
      jumlah: Number(item.porsi ?? item.jumlah ?? 0),
      ketersediaan:
        item.ketersediaan ||
        (item.jam || item.batas
          ? `Batas ambil ${item.jam || item.batas}`
          : "Tersedia"),
      alamat: item.alamat || "-",
    }));
  } catch (error) {
    console.error("Gagal membaca data makanan:", error);
    return [];
  }
};

const simpanMakanan = (data) => {
  localStorage.setItem(MAKANAN_KEY, JSON.stringify(data));

  // Memberi tahu halaman lain bahwa data makanan berubah
  window.dispatchEvent(new Event("surplus-food-updated"));
};

const formatHarga = (harga) => {
  const nilai = Number(harga) || 0;

  return nilai === 0
    ? "Gratis"
    : `Rp ${nilai.toLocaleString("id-ID")}`;
};

function DashboardMakanan() {
  const [makanan, setMakanan] = useState(bacaMakanan);
  const [pencarian, setPencarian] = useState("");

  const location = useLocation();

  // Sinkronisasi data ketika ada perubahan dari halaman lain
  useEffect(() => {
    const muatMakanan = () => {
      setMakanan(bacaMakanan());
    };

    muatMakanan();

    window.addEventListener("storage", muatMakanan);
    window.addEventListener("surplus-food-updated", muatMakanan);

    return () => {
      window.removeEventListener("storage", muatMakanan);
      window.removeEventListener("surplus-food-updated", muatMakanan);
    };
  }, []);

  const hasilPencarian = useMemo(() => {
    const keyword = pencarian.toLowerCase().trim();

    if (!keyword) return makanan;

    return makanan.filter((item) =>
      [
        item.nama,
        formatHarga(item.harga),
        String(item.jumlah),
        item.ketersediaan,
        item.alamat,
        item.restoran || "",
      ].some((nilai) =>
        String(nilai).toLowerCase().includes(keyword)
      )
    );
  }, [makanan, pencarian]);

  const hapusMakanan = (id) => {
    if (!window.confirm("Yakin ingin menghapus data makanan ini?")) {
      return;
    }

    const dataTerbaru = bacaMakanan();
    const dataBaru = dataTerbaru.filter(
      (item) => String(item.id) !== String(id)
    );

    simpanMakanan(dataBaru);
    setMakanan(dataBaru);
  };

  const editMakanan = (item) => {
    const nama = window.prompt("Nama makanan:", item.nama);

    if (nama === null || !nama.trim()) return;

    const hargaInput = window.prompt(
      "Harga makanan (isi 0 jika gratis):",
      String(item.harga)
    );

    if (hargaInput === null || !hargaInput.trim()) return;

    const harga = Number(hargaInput);

    if (!Number.isFinite(harga) || harga < 0) {
      window.alert("Harga harus berupa angka 0 atau lebih.");
      return;
    }

    const jumlahInput = window.prompt(
      "Jumlah porsi:",
      String(item.jumlah)
    );

    if (jumlahInput === null || !jumlahInput.trim()) return;

    const jumlah = Number(jumlahInput);

    if (!Number.isInteger(jumlah) || jumlah < 0) {
      window.alert("Jumlah porsi harus berupa bilangan bulat 0 atau lebih.");
      return;
    }

    const alamat = window.prompt("Alamat:", item.alamat);

    if (alamat === null) return;

    // Baca data asli agar field lain milik Mitra tidak hilang
    const dataAsli = JSON.parse(
      localStorage.getItem(MAKANAN_KEY) || "[]"
    );

    const dataBaru = dataAsli.map((data, index) => {
      const idData = data.id ?? `makanan-${index}`;

      if (String(idData) !== String(item.id)) {
        return data;
      }

      return {
        ...data,

        // Nama makanan dibaca oleh halaman Penerima
        makanan: nama.trim(),
        nama: nama.trim(),

        // Harga harus berupa angka agar filter Penerima berfungsi
        harga,

        // Penerima menggunakan field porsi
        porsi: jumlah,
        jumlah,

        alamat: alamat.trim(),
      };
    });

    simpanMakanan(dataBaru);
    setMakanan(bacaMakanan());

    window.alert("Data makanan berhasil diperbarui.");
  };

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
          <span className="makanan-brand-logo" aria-hidden="true">
            ♨
          </span>
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
          <div className="makanan-title-icon" aria-hidden="true">
            ▰
          </div>

          <div>
            <h1>Kelola Data Makanan</h1>
            <p>Kelola data makanan yang dibagikan Mitra</p>
          </div>
        </section>

        <div className="makanan-toolbar">
          <label className="makanan-search">
            <span className="makanan-search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              placeholder="Cari makanan atau restoran..."
              value={pencarian}
              onChange={(event) =>
                setPencarian(event.target.value)
              }
              aria-label="Cari data makanan"
            />
          </label>
        </div>

        <section
          className="makanan-table-panel"
          aria-label="Tabel data makanan"
        >
          <div className="makanan-table-scroll">
            <table className="makanan-table">
              <thead>
                <tr>
                  <th>Nama Makanan</th>
                  <th>Harga</th>
                  <th>Jumlah</th>
                  <th>Ketersediaan</th>
                  <th>Alamat</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {hasilPencarian.length > 0 ? (
                  hasilPencarian.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nama}</td>
                      <td>{formatHarga(item.harga)}</td>
                      <td>{item.jumlah}</td>
                      <td>{item.ketersediaan}</td>
                      <td>{item.alamat}</td>

                      <td>
                        <div className="makanan-actions">
                          <button
                            type="button"
                            className="makanan-action-btn"
                            onClick={() => editMakanan(item)}
                            aria-label={`Edit ${item.nama}`}
                            title="Edit"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
                              <path d="m15 3 6 6M10 14l-1 4 4-1L22 8l-5-5z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            className="makanan-action-btn"
                            onClick={() => hapusMakanan(item.id)}
                            aria-label={`Hapus ${item.nama}`}
                            title="Hapus"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 10v8M14 10v8" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="makanan-empty">
                      {pencarian
                        ? "Data makanan tidak ditemukan."
                        : "Belum ada data makanan dari Mitra."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="makanan-footer">
        © 2026 Surplus - Platform Distribusi Makanan Berlebih.
      </footer>
    </div>
  );
}

export default DashboardMakanan;
