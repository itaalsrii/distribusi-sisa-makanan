
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./LaporanAdmin.css";
import AdminProfile from "./AdminProfile";

const CLAIMS_KEY = "surplus_klaim";
const MAKANAN_KEY = "surplus_makanan";

// Membaca data laporan dari localStorage
const bacaLaporan = () => {
  try {
    const dataKlaim = JSON.parse(
      localStorage.getItem(CLAIMS_KEY) || "[]"
    );

    const daftarMakanan = JSON.parse(
      localStorage.getItem(MAKANAN_KEY) || "[]"
    );

    if (!Array.isArray(dataKlaim)) return [];

    const makananList = Array.isArray(daftarMakanan)
      ? daftarMakanan
      : [];

    return dataKlaim.map((item, index) => {
      // Mencocokkan makanan berdasarkan ID
      const makananMitra = makananList.find(
        (m) =>
          item.idMakanan != null &&
          m.id != null &&
          String(m.id) === String(item.idMakanan)
      ) || makananList.find(
        (m) =>
          String(m.makanan || m.nama || "").toLowerCase() ===
            String(item.makanan || item.namaMakanan || "").toLowerCase() &&
          String(m.restoran || m.namaMitra || "").toLowerCase() ===
            String(item.restoran || item.namaMitra || "").toLowerCase()
      );

      // Mengambil nama Mitra dari data klaim atau data makanan
      const namaMitra =
        item.restoran ||
        item.namaMitra ||
        item.namaRestoran ||
        makananMitra?.restoran ||
        makananMitra?.namaMitra ||
        makananMitra?.namaRestoran ||
        "-";

      // Jumlah awal makanan yang disediakan Mitra
      const jumlahTersedia = Number(
        makananMitra?.porsi ??
        makananMitra?.jumlah ??
        0
      );

      // Menyesuaikan format harga
      const hargaAsli = item.harga;
      let harga = "Gratis";

      if (
        hargaAsli !== undefined &&
        hargaAsli !== null &&
        String(hargaAsli).trim() !== ""
      ) {
        if (
          Number(hargaAsli) === 0 ||
          String(hargaAsli).toLowerCase() === "gratis"
        ) {
          harga = "Gratis";
        } else if (
          String(hargaAsli).toLowerCase().includes("rp")
        ) {
          harga = hargaAsli;
        } else {
          harga = `Rp ${Number(hargaAsli).toLocaleString("id-ID")}`;
        }
      }

      return {
        id: item.id ?? `${item.idMakanan ?? "klaim"}-${index}`,
        penerima: item.nama || item.penerima || "-",
        namaMitra,
        makanan: item.makanan || item.namaMakanan || "-",
        harga,
        jumlah: Number(item.jumlah) || 0,
        ketersediaan: `${jumlahTersedia} porsi`,
        alamat: item.alamat || "-",
      };
    });
  } catch (error) {
    console.error("Gagal membaca data laporan:", error);
    return [];
  }
};

function LaporanAdmin() {
  const [laporan, setLaporan] = useState(() => bacaLaporan());
  const [pencarian, setPencarian] = useState("");

  const location = useLocation();

  // Memuat ulang laporan ketika data berubah
  useEffect(() => {
    const muatLaporan = () => {
      setLaporan(bacaLaporan());
    };

    window.addEventListener("storage", muatLaporan);
    window.addEventListener("surplus-claims-updated", muatLaporan);
    window.addEventListener("surplus-food-updated", muatLaporan);
    window.addEventListener("surplus-makanan-updated", muatLaporan);

    return () => {
      window.removeEventListener("storage", muatLaporan);
      window.removeEventListener("surplus-claims-updated", muatLaporan);
      window.removeEventListener("surplus-food-updated", muatLaporan);
      window.removeEventListener("surplus-makanan-updated", muatLaporan);
    };
  }, []);

  // Pencarian berdasarkan nama penerima, Mitra, dan makanan
  const dataTersaring = useMemo(() => {
    const kata = pencarian.toLowerCase().trim();

    if (!kata) return laporan;

    return laporan.filter((item) =>
      [
        item.penerima,
        item.namaMitra,
        item.makanan,
        item.harga,
        String(item.jumlah),
        item.ketersediaan,
        item.alamat,
      ].some((nilai) =>
        String(nilai).toLowerCase().includes(kata)
      )
    );
  }, [laporan, pencarian]);

  // Ekspor laporan ke CSV yang dapat dibuka di Excel
  const unduhCSV = () => {
    if (dataTersaring.length === 0) {
      alert("Tidak ada data laporan untuk diunduh.");
      return;
    }

    const header = [
      "Nama Penerima",
      "Nama Mitra",
      "Nama Makanan",
      "Harga",
      "Jumlah Diklaim",
      "Ketersediaan Mitra",
      "Alamat",
    ];

    const rows = dataTersaring.map((item) => [
      item.penerima,
      item.namaMitra,
      item.makanan,
      item.harga,
      item.jumlah,
      item.ketersediaan,
      item.alamat,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "laporan-distribusi-makanan.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // Cetak atau simpan laporan sebagai PDF melalui browser
  const unduhPDF = () => {
    if (dataTersaring.length === 0) {
      alert("Tidak ada data laporan untuk dicetak.");
      return;
    }

    window.print();
  };

  const menu = [
    { label: "Beranda", to: "/admin" },
    { label: "Data Pengguna", to: "/admin/pengguna" },
    { label: "Data Makanan", to: "/admin/makanan" },
    { label: "Laporan", to: "/admin/laporan" },
  ];

  function LogoSurplus() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-label="Logo Surplus">
      <path
        d="M17 7 C9 12 27 14 18 20 M29 7 C21 12 39 14 30 20 M23 4 C15 9 33 11 24 17"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M7 31 C9 22 16 19 24 19 C32 19 39 22 41 31 Z"
        fill="white"
      />
      <path
        d="M5 34 H43 M12 38 H36"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

  return (
    <div className="users-page">
      <header className="users-navbar">
        <Link to="/admin" className="users-brand">
          <div className="users-brand-icon">
            <LogoSurplus />
          </div>
          <span>Surplus</span>
        </Link>

        <nav className="laporan-nav" aria-label="Navigasi admin">
          {menu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={
                location.pathname === item.to ? "active" : ""
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <AdminProfile />
      </header>

      <main className="laporan-main">
        <section className="laporan-heading">
          <div className="laporan-heading-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 2h9l6 6v14H5z" />
              <path d="M14 2v6h6M3 13h12m-4-4 4 4-4 4" />
            </svg>
          </div>

          <div className="laporan-heading-copy">
            <h1>Laporan &amp; Ekspor Rekapitulasi</h1>
            <p>
              Lihat dan unduh rekapitulasi penyaluran makanan
            </p>
          </div>

          <div className="laporan-export-actions">
            <button
              type="button"
              className="laporan-export excel"
              onClick={unduhCSV}
            >
              <span aria-hidden="true">▧</span> Unduh Excel
            </button>

            <button
              type="button"
              className="laporan-export pdf"
              onClick={unduhPDF}
            >
              <span aria-hidden="true">▤</span> Unduh PDF
            </button>
          </div>
        </section>

        <div className="laporan-toolbar">
          <label className="laporan-search">
            <span
              className="laporan-search-icon"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 5 5" />
              </svg>
            </span>

            <input
              type="search"
              placeholder="Cari laporan..."
              value={pencarian}
              onChange={(event) =>
                setPencarian(event.target.value)
              }
              aria-label="Cari laporan"
            />
          </label>
        </div>

        <section
          className="laporan-table-panel"
          aria-label="Rekapitulasi penyaluran makanan"
        >
          <div className="laporan-table-scroll">
            <table className="laporan-table">
              <thead>
                <tr>
                  <th>Nama Penerima</th>
                  <th>Nama Mitra</th>
                  <th>Nama Makanan</th>
                  <th>Harga</th>
                  <th>Jumlah</th>
                  <th>Ketersediaan</th>
                  <th>Alamat</th>
                </tr>
              </thead>

              <tbody>
                {dataTersaring.length > 0 ? (
                  dataTersaring.map((item) => (
                    <tr key={item.id}>
                      <td>{item.penerima}</td>
                      <td>{item.namaMitra}</td>
                      <td>{item.makanan}</td>
                      <td>{item.harga}</td>
                      <td>{item.jumlah}</td>
                      <td>{item.ketersediaan}</td>
                      <td>{item.alamat}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="laporan-empty">
                      {laporan.length === 0
                        ? "Belum ada data klaim makanan."
                        : "Data laporan tidak ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="laporan-footer">
        © 2026 Surplus - Platform Distribusi Makanan Berlebih.
      </footer>
    </div>
  );
}

export default LaporanAdmin;
