
import { useState } from "react";
import { Link } from "react-router-dom";
import DataPengguna from "./DataPenggunaAdmin";
import DataMakanan from "./DataMakananAdmin";
import "./AdminDashboard.css";

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

function AdminDashboard() {
  const [menuAktif, setMenuAktif] = useState("Beranda");

  const menu = [
    { label: "Beranda", to: "/admin" },
    { label: "Data Pengguna", to: "/admin/pengguna" },
    { label: "Data Makanan", to: "/admin/makanan" },
    { label: "Laporan", to: "/admin/laporan" },
  ];

  const aktivitas = [
    {
      no: 1,
      mitra: "Densiko",
      penerima: "Ita",
      makanan: "Naspad",
      status: "Terkirim",
    },
    {
      no: 2,
      mitra: "Supermarket",
      penerima: "Wulan",
      makanan: "Roti",
      status: "Selesai",
    },
  ];

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
              key={item.label}
              to={item.to}
              className={`admin-nav-link ${
                menuAktif === item.label ? "active" : ""
              }`}
              onClick={() => setMenuAktif(item.label)}
            >
              {item.label}
            </Link>
          ))}

          <button
            type="button"
            className="admin-profile"
            onClick={() => alert("Profil Admin")}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 12 6Zm0 13a7 7 0 0 1-5.5-2.7c.1-2.1 3.7-3.3 5.5-3.3s5.4 1.2 5.5 3.3A7 7 0 0 1 12 19Z" />
            </svg>
            <span>Admin</span>
          </button>
        </nav>
      </header>

      <main className="admin-main">
        {menuAktif === "Data Pengguna" ? (
          <DataPengguna />
        ) : menuAktif === "Data Makanan" ? (
          <DataMakanan />
        ) : menuAktif === "Beranda" ? (
          <>
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
                    <h2>300</h2>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-icon partner-stat-icon">♧</div>
                  <div>
                    <p>Total Mitra</p>
                    <h2>15</h2>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-icon receiver-stat-icon">♧</div>
                  <div>
                    <p>Total Penerima Manfaat</p>
                    <h2>150</h2>
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-dashboard-grid">
              <div className="admin-panel chart-panel">
                <h2>Grafik Distribusi Makanan</h2>

                <div className="chart-area">
                  <div className="chart-bars">
                    {[40, 55, 70, 82, 69, 54, 40].map(
                      (tinggi, index) => (
                        <div
                          key={index}
                          className="chart-bar"
                          style={{ height: `${tinggi}%` }}
                          title={`Periode ${index + 1}`}
                        />
                      )
                    )}
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
                      {aktivitas.map((item) => (
                        <tr key={item.no}>
                          <td>{item.no}</td>
                          <td>{item.mitra}</td>
                          <td>{item.penerima}</td>
                          <td>{item.makanan}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="admin-placeholder">
            <h1>{menuAktif}</h1>
            <p>Halaman ini belum dibuat.</p>
          </section>
        )}
      </main>

      <footer className="admin-footer">
        © 2026 Surplus - Platform Distribusi Makanan Berlebih.
      </footer>
    </div>
  );
}

export default AdminDashboard;
