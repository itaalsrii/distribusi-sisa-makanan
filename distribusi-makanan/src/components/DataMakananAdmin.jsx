
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DataMakananAdmin.css";
import AdminProfile from "./AdminProfile";

const MAKANAN_KEY = "surplus_makanan";
const KLAIM_KEY = "surplus_klaim";

// Membaca data makanan dari localStorage
const bacaMakanan = () => {
  try {
    const data = JSON.parse(localStorage.getItem(MAKANAN_KEY) || "[]");

    if (!Array.isArray(data)) return [];

    return data.map((item, index) => {
      const jumlah = Number(item.porsi ?? item.jumlah ?? 0);

      return {
        ...item,
        id: item.id ?? `makanan-${index}`,
        nama: item.makanan || item.nama || "-",
        harga: item.harga ?? "Gratis",
        jumlah,
        ketersediaan: `${jumlah} porsi`,
        alamat: item.alamat || "-",
      };
    });
  } catch (error) {
    console.error("Gagal membaca data makanan:", error);
    return [];
  }
};

// Membaca data klaim
const bacaKlaim = () => {
  try {
    const data = JSON.parse(localStorage.getItem(KLAIM_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Gagal membaca data klaim:", error);
    return [];
  }
};

// Format harga makanan
const formatHarga = (harga) => {
  if (
    harga === undefined ||
    harga === null ||
    String(harga).trim() === "" ||
    String(harga).toLowerCase() === "gratis" ||
    Number(harga) === 0
  ) {
    return "Gratis";
  }

  if (String(harga).toLowerCase().includes("rp")) {
    return harga;
  }

  return `Rp ${Number(harga).toLocaleString("id-ID")}`;
};

function DashboardMakanan() {
  const [makanan, setMakanan] = useState(() => bacaMakanan());
  const [klaim, setKlaim] = useState(() => bacaKlaim());
  const [pencarian, setPencarian] = useState("");

  const location = useLocation();

  // Menghitung porsi dari klaim yang sudah selesai
  const hitungTersalurkan = (item) => {
    return klaim
      .filter(
        (data) =>
          String(data.idMakanan) === String(item.id) &&
          String(data.status).toLowerCase().trim() === "selesai"
      )
      .reduce((total, data) => total + Number(data.jumlah || 0), 0);
  };

  // Menyimpan perubahan data makanan
  const simpanMakanan = (daftar) => {
    localStorage.setItem(MAKANAN_KEY, JSON.stringify(daftar));
    setMakanan(bacaMakanan());
    window.dispatchEvent(new Event("surplus-food-updated"));
  };

  // Memperbarui data makanan dan klaim
  useEffect(() => {
    const muatMakanan = () => setMakanan(bacaMakanan());
    const muatKlaim = () => setKlaim(bacaKlaim());

    const muatSemua = () => {
      muatMakanan();
      muatKlaim();
    };

    window.addEventListener("storage", muatSemua);
    window.addEventListener("surplus-food-updated", muatMakanan);
    window.addEventListener("surplus-makanan-updated", muatMakanan);
    window.addEventListener("surplus-claims-updated", muatKlaim);

    return () => {
      window.removeEventListener("storage", muatSemua);
      window.removeEventListener("surplus-food-updated", muatMakanan);
      window.removeEventListener("surplus-makanan-updated", muatMakanan);
      window.removeEventListener("surplus-claims-updated", muatKlaim);
    };
  }, []);

  // Pencarian berdasarkan data makanan
  const hasilPencarian = useMemo(() => {
    const keyword = pencarian.toLowerCase().trim();

    if (!keyword) return makanan;

    return makanan.filter((item) =>
      [
        item.nama,
        formatHarga(item.harga),
        String(item.jumlah),
        item.ketersediaan,
        String(hitungTersalurkan(item)),
        item.alamat,
      ].some((nilai) =>
        String(nilai).toLowerCase().includes(keyword)
      )
    );
  }, [makanan, klaim, pencarian]);

  // Menghapus makanan
  const hapusMakanan = (id) => {
    if (!window.confirm("Yakin ingin menghapus data makanan ini?")) {
      return;
    }

    const daftarAsli = JSON.parse(
      localStorage.getItem(MAKANAN_KEY) || "[]"
    );

    const daftarBaru = daftarAsli.filter(
      (item, index) =>
        String(item.id ?? `makanan-${index}`) !== String(id)
    );

    simpanMakanan(daftarBaru);
  };

  // Mengedit data makanan yang disediakan Mitra
  const editMakanan = (item) => {
    const nama = window.prompt("Nama makanan:", item.nama);

    if (nama === null || !nama.trim()) return;

    const harga = window.prompt(
      "Harga makanan (isi 0 jika gratis):",
      String(item.harga === "Gratis" ? 0 : item.harga).replace(
        /^Rp\s*/i,
        ""
      )
    );

    if (harga === null || !harga.trim()) return;

    const jumlahInput = window.prompt(
      "Jumlah makanan yang disediakan Mitra (porsi):",
      String(item.jumlah)
    );

    if (jumlahInput === null || !jumlahInput.trim()) return;

    const jumlah = Number(jumlahInput);

    if (!Number.isFinite(jumlah) || jumlah < 0) {
      alert("Jumlah makanan harus berupa angka 0 atau lebih.");
      return;
    }

    const alamat = window.prompt("Alamat:", item.alamat);

    if (alamat === null || !alamat.trim()) return;

    const daftarAsli = JSON.parse(
      localStorage.getItem(MAKANAN_KEY) || "[]"
    );

    const indexMakanan = daftarAsli.findIndex(
      (data, index) =>
        String(data.id ?? `makanan-${index}`) === String(item.id)
    );

    if (indexMakanan === -1) {
      alert("Data makanan tidak ditemukan.");
      setMakanan(bacaMakanan());
      return;
    }

    const dataLama = daftarAsli[indexMakanan];

    daftarAsli[indexMakanan] = {
      ...dataLama,
      makanan: nama.trim(),
      nama: nama.trim(),
      harga: Number(harga) === 0 ? 0 : Number(harga),
      porsi: jumlah,
      jumlah,
      alamat: alamat.trim(),
    };

    simpanMakanan(daftarAsli);
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
              onChange={(event) => setPencarian(event.target.value)}
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
                  <th>Tersalurkan</th>
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

                      <td>{hitungTersalurkan(item)} porsi</td>

                      {/* Tetap menampilkan jumlah awal dari Mitra */}
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
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9M15 3l6 6M10 14l-1 4 4-1L22 8l-5-5z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            className="makanan-action-btn"
                            onClick={() => hapusMakanan(item.id)}
                            aria-label={`Hapus ${item.nama}`}
                            title="Hapus"
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
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
                      {makanan.length === 0
                        ? "Belum ada data makanan dari Mitra."
                        : "Data makanan tidak ditemukan."}
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
