
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminDashboard.css";
import AdminProfile from "./AdminProfile";

const KEY_MAKANAN = "surplus_makanan";
const KEY_AKUN = "surplus_accounts";
const KEY_KLAIM = "surplus_klaim";

const bacaData = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Gagal membaca ${key}:`, error);
    return [];
  }
};

const normalisasi = (nilai) =>
  String(nilai ?? "").trim().toLowerCase();

const bacaTanggal = (item) => {
  const nilai =
    item.waktuKlaim ||
    item.tanggalKlaim ||
    item.tanggal ||
    item.createdAt;

  if (!nilai) return null;

  const tanggal = new Date(nilai);

  return Number.isNaN(tanggal.getTime()) ? null : tanggal;
};

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

function LogoBanner() {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-label="Logo Surplus">
      <circle cx="50" cy="50" r="49" fill="#e52529" />
      <path
        d="M18 32 C27 42 35 22 49 28 C39 37 46 46 58 52 C73 60 67 77 49 84 C57 69 42 63 32 57 C23 52 27 43 18 32Z"
        fill="#29292c"
      />
      <path
        d="M65 19 C78 29 83 43 77 57 C72 49 64 42 66 34 C67 28 69 24 65 19Z"
        fill="#29292c"
      />
      <path
        d="M12 24 C18 14 28 8 39 6 C31 13 29 21 32 29 C24 25 18 25 12 24Z"
        fill="#29292c"
      />
    </svg>
  );
}

function DashboardAdmin() {
  const location = useLocation();

  const [makanan, setMakanan] = useState(() =>
    bacaData(KEY_MAKANAN)
  );

  const [akun, setAkun] = useState(() =>
    bacaData(KEY_AKUN)
  );

  const [klaim, setKlaim] = useState(() =>
    bacaData(KEY_KLAIM)
  );

  const menu = [
    { label: "Beranda", to: "/admin" },
    { label: "Data Pengguna", to: "/admin/pengguna" },
    { label: "Data Makanan", to: "/admin/makanan" },
    { label: "Laporan", to: "/admin/laporan" },
  ];

  // Memuat ulang data ketika makanan, akun, atau klaim berubah
  useEffect(() => {
    const muatData = () => {
      setMakanan(bacaData(KEY_MAKANAN));
      setAkun(bacaData(KEY_AKUN));
      setKlaim(bacaData(KEY_KLAIM));
    };

    window.addEventListener("storage", muatData);
    window.addEventListener("surplus-food-updated", muatData);
    window.addEventListener("surplus-claims-updated", muatData);

    return () => {
      window.removeEventListener("storage", muatData);
      window.removeEventListener("surplus-food-updated", muatData);
      window.removeEventListener("surplus-claims-updated", muatData);
    };
  }, []);

  // Total Makanan Surplus: jumlah porsi yang disediakan Mitra
  const totalMakanan = useMemo(() => {
    return makanan.reduce((total, item) => {
      const jumlah = Number(item.porsi ?? item.jumlah ?? 0);
      return total + (Number.isFinite(jumlah) ? Math.max(0, jumlah) : 0);
    }, 0);
  }, [makanan]);

  // Total Mitra berdasarkan akun dengan role Mitra
  const totalMitra = useMemo(() => {
    const mitraUnik = new Set();

    akun.forEach((item, index) => {
      const role = normalisasi(
        item.role || item.peran || item.jenisAkun
      );

      if (role !== "mitra") return;

      const identitas =
        item.id ??
        item.email ??
        item.username ??
        item.namaRestoran ??
        item.restoran ??
        `mitra-${index}`;

      mitraUnik.add(normalisasi(identitas));
    });

    return mitraUnik.size;
  }, [akun]);

  // Total Penerima Manfaat berdasarkan penerima unik yang pernah klaim
  const totalPenerima = useMemo(() => {
    const penerimaUnik = new Set();

    klaim.forEach((item) => {
      const whatsapp = normalisasi(
        item.whatsapp || item.noWhatsapp
      );

      const nama = normalisasi(item.nama || item.penerima);

      if (whatsapp) {
        penerimaUnik.add(`wa:${whatsapp}`);
      } else if (nama && nama !== "-") {
        penerimaUnik.add(`nama:${nama}`);
      }
    });

    return penerimaUnik.size;
  }, [klaim]);

  // Aktivitas terbaru berdasarkan tanggal klaim
  const aktivitas = useMemo(() => {
    return klaim
      .map((item, index) => ({
        no: index + 1,
        mitra:
          item.restoran ||
          item.namaRestoran ||
          item.mitra ||
          "-",
        penerima: item.nama || item.penerima || "-",
        makanan: item.makanan || item.namaMakanan || "-",
        status:
          item.status ||
          item.statusPembayaran ||
          "Menunggu Konfirmasi",
        tanggal: bacaTanggal(item),
        index,
        id: item.id ?? `${item.idMakanan ?? "klaim"}-${index}`,
      }))
      .sort((a, b) => {
        if (a.tanggal && b.tanggal) {
          return b.tanggal.getTime() - a.tanggal.getTime();
        }

        if (a.tanggal) return -1;
        if (b.tanggal) return 1;

        return b.index - a.index;
      })
      .slice(0, 5)
      .map((item, index) => ({ ...item, no: index + 1 }));
  }, [klaim]);

  // Grafik jumlah klaim per hari selama tujuh hari terakhir
  const dataGrafik = useMemo(() => {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    const daftarHari = [];

    for (let mundur = 6; mundur >= 0; mundur--) {
      const tanggal = new Date(hariIni);
      tanggal.setDate(hariIni.getDate() - mundur);

      daftarHari.push({
        tanggal,
        label: tanggal.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
        jumlah: 0,
      });
    }

    klaim.forEach((item) => {
      const tanggalKlaim = bacaTanggal(item);
      if (!tanggalKlaim) return;

      tanggalKlaim.setHours(0, 0, 0, 0);

      const hari = daftarHari.find(
        (data) =>
          data.tanggal.getTime() === tanggalKlaim.getTime()
      );

      if (hari) {
        hari.jumlah += 1;
      }
    });

    return daftarHari;
  }, [klaim]);

  const jumlahMaksimum = Math.max(
    1,
    ...dataGrafik.map((item) => item.jumlah)
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-navbar">
        <Link to="/admin" className="admin-brand">
          <div className="admin-brand-icon">
            <LogoSurplus />
          </div>
          <span>Surplus</span>
        </Link>

        <nav className="admin-nav-menu">
          {menu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-link ${
                location.pathname === item.to ? "active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          <AdminProfile />
        </nav>
      </header>

      <main className="admin-main">
        <section className="admin-welcome">
          <div className="admin-welcome-heading">
            <div className="admin-banner-logo">
              <LogoBanner />
            </div>
            <div>
              <h1>Selamat Datang, Admin!!</h1>
              <p>
                Pantau dan kelola distribusi makanan berlebih dengan mudah.
              </p>
            </div>
          </div>

          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="stat-icon food-stat-icon">♨</div>
              <div>
                <p>Total Makanan Surplus</p>
                <h2>{totalMakanan.toLocaleString("id-ID")}</h2>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon partner-stat-icon">♧</div>
              <div>
                <p>Total Mitra</p>
                <h2>{totalMitra.toLocaleString("id-ID")}</h2>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon receiver-stat-icon">♧</div>
              <div>
                <p>Total Penerima Manfaat</p>
                <h2>{totalPenerima.toLocaleString("id-ID")}</h2>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-dashboard-grid">
          <div className="admin-panel chart-panel">
            <h2>Grafik Distribusi Makanan</h2>
            <div className="chart-area">
              <div className="chart-bars">
                {dataGrafik.map((item) => {
                  const tinggi =
                    item.jumlah === 0
                      ? 0
                      : Math.max(
                          5,
                          (item.jumlah / jumlahMaksimum) * 100
                        );

                  return (
                    <div
                      key={item.label}
                      className="chart-bar"
                      style={{ height: `${tinggi}%` }}
                      title={`${item.label}: ${item.jumlah} klaim`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="admin-panel activity-panel">
            <h2>Aktivitas Terbaru</h2>
            <div className="activity-table-wrapper">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Mitra</th>
                    <th>Penerima</th>
                    <th>Jenis Makanan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {aktivitas.length > 0 ? (
                    aktivitas.map((item) => (
                      <tr key={item.id}>
                        <td>{item.no}</td>
                        <td>{item.mitra}</td>
                        <td>{item.penerima}</td>
                        <td>{item.makanan}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">
                        Belum ada aktivitas distribusi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="admin-footer">
        © 2026 Surplus - Platform Distribusi Makanan Berlebih.
      </footer>
    </div>
  );
}

export default DashboardAdmin;
