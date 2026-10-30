import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DataPenggunaAdmin.css";
import AdminProfile from "./AdminProfile";

const ACCOUNTS_KEY = "surplus_accounts";
const CLAIMS_KEY = "surplus_klaim";

function bacaDataPengguna() {
  try {
    const accounts = JSON.parse(
      localStorage.getItem(ACCOUNTS_KEY) || "[]"
    );

    const klaim = JSON.parse(
      localStorage.getItem(CLAIMS_KEY) || "[]"
    );

    // Data akun Admin dan Mitra
    const dataAkun = accounts.map((account, index) => ({
      id: account.id || `akun-${index}`,
      nama:
        account.namaPemilik ||
        account.namaUsaha ||
        account.nama ||
        "-",
      email: account.email || "-",
      kontak: account.noHp || account.whatsapp || "-",
      peran:
        String(account.role || "").toLowerCase() === "mitra"
          ? "Mitra"
          : String(account.role || "").toLowerCase() === "admin"
            ? "Admin"
            : account.role || "Pengguna",
      status: account.status || "Aktif",
      sumber: "akun",
      accountId: account.id || null,
    }));

    // Data Penerima diambil dari klaim makanan
    // Nomor WhatsApp digunakan untuk mencegah data ganda
    const penerimaUnik = new Map();

    klaim.forEach((item) => {
      const nama = String(item.nama || "").trim();
      const whatsapp = String(item.whatsapp || "").trim();

      if (!nama || !whatsapp) return;

      const kunci = whatsapp.replace(/[\s\-+()]/g, "");

      if (!penerimaUnik.has(kunci)) {
        penerimaUnik.set(kunci, {
          id: `penerima-${kunci}`,
          nama,
          email: "-",
          kontak: whatsapp,
          peran: "Penerima",
          status: "Aktif",
          sumber: "klaim",
          whatsappAsli: whatsapp,
        });
      }
    });

    return [...dataAkun, ...penerimaUnik.values()];
  } catch (error) {
    console.error("Gagal membaca data pengguna:", error);
    return [];
  }
}

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

function UserIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
      <circle cx="24" cy="14" r="11" />
      <path d="M5 43v-5c0-8 8-13 19-13s19 5 19 13v5H5z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="10.8"
        cy="10.8"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m16 16 5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4H5a2 2 0 0 0-2 2v13h13a2 2 0 0 0 2-2v-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m10 14 1-4L19 2l3 3-8 8-4 1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M9 6V4h6v2m-9 0 1 15h10l1-15M10 10v7m4-7v7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DataPengguna() {
  const [search, setSearch] = useState("");
  const [pengguna, setPengguna] = useState(bacaDataPengguna);
  const [editId, setEditId] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [pesan, setPesan] = useState("");

  const location = useLocation();

  const menu = [
    { label: "Beranda", to: "/admin" },
    { label: "Data Pengguna", to: "/admin/pengguna" },
    { label: "Data Makanan", to: "/admin/makanan" },
    { label: "Laporan", to: "/admin/laporan" },
  ];

  // Memuat ulang data saat halaman dibuka atau data klaim berubah
  useEffect(() => {
    const muatDataPengguna = () => {
      setPengguna(bacaDataPengguna());
    };

    muatDataPengguna();

    window.addEventListener("storage", muatDataPengguna);
    window.addEventListener("surplus-claims-updated", muatDataPengguna);

    return () => {
      window.removeEventListener("storage", muatDataPengguna);
      window.removeEventListener(
        "surplus-claims-updated",
        muatDataPengguna
      );
    };
  }, []);

  const hasilPencarian = pengguna.filter((item) =>
    `${item.nama} ${item.email} ${item.kontak} ${item.peran} ${item.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const mulaiEdit = (item) => {
    setEditId(item.id);
    setFormEdit({ ...item });
    setPesan("");
  };

  // Menyimpan perubahan akun Admin/Mitra ke localStorage
  const simpanEdit = (e) => {
    e.preventDefault();

    const dataBaru = {
      ...formEdit,
      nama: formEdit.nama.trim(),
      email: formEdit.email.trim(),
      kontak: formEdit.kontak.trim(),
    };

    if (dataBaru.sumber === "akun") {
      try {
        const accounts = JSON.parse(
          localStorage.getItem(ACCOUNTS_KEY) || "[]"
        );

        const accountsBaru = accounts.map((account, index) => {
          const id = account.id || `akun-${index}`;

          if (id !== editId) return account;

          return {
            ...account,
            namaPemilik:
              dataBaru.peran === "Mitra"
                ? dataBaru.nama
                : account.namaPemilik,
            namaUsaha:
              dataBaru.peran === "Mitra"
                ? dataBaru.nama
                : account.namaUsaha,
            nama:
              dataBaru.peran === "Admin"
                ? dataBaru.nama
                : account.nama,
            email: dataBaru.email,
            noHp: dataBaru.kontak,
            role: dataBaru.peran.toLowerCase(),
            status: dataBaru.status,
          };
        });

        localStorage.setItem(
          ACCOUNTS_KEY,
          JSON.stringify(accountsBaru)
        );
      } catch (error) {
        console.error("Gagal menyimpan akun:", error);
        setPesan("Gagal menyimpan perubahan akun.");
        return;
      }
    } else if (dataBaru.sumber === "klaim") {
      // Nama dan nomor kontak penerima berasal dari data klaim.
      // Perubahan diterapkan pada semua klaim dengan nomor yang sama.
      try {
        const klaim = JSON.parse(
          localStorage.getItem(CLAIMS_KEY) || "[]"
        );

        const nomorLama = String(
          dataBaru.whatsappAsli || dataBaru.kontak
        ).replace(/[\s\-+()]/g, "");

        const klaimBaru = klaim.map((item) => {
          const nomorItem = String(item.whatsapp || "").replace(
            /[\s\-+()]/g,
            ""
          );

          if (nomorItem !== nomorLama) return item;

          return {
            ...item,
            nama: dataBaru.nama,
            whatsapp: dataBaru.kontak,
          };
        });

        localStorage.setItem(CLAIMS_KEY, JSON.stringify(klaimBaru));

        window.dispatchEvent(new Event("surplus-claims-updated"));
      } catch (error) {
        console.error("Gagal menyimpan data penerima:", error);
        setPesan("Gagal menyimpan perubahan data penerima.");
        return;
      }
    }

    setPengguna(bacaDataPengguna());
    setEditId(null);
    setPesan("Data pengguna berhasil diperbarui.");
  };

  const hapusPengguna = (item) => {
    const yakin = window.confirm(
      `Apakah kamu yakin ingin menghapus ${item.nama}?`
    );

    if (!yakin) return;

    try {
      if (item.sumber === "akun") {
        const accounts = JSON.parse(
          localStorage.getItem(ACCOUNTS_KEY) || "[]"
        );

        const accountsBaru = accounts.filter((account, index) => {
          const id = account.id || `akun-${index}`;
          return id !== item.id;
        });

        localStorage.setItem(
          ACCOUNTS_KEY,
          JSON.stringify(accountsBaru)
        );
      } else if (item.sumber === "klaim") {
        // Menghapus data klaim milik penerima ini.
        // Catatan: semua riwayat klaim dengan nomor yang sama ikut terhapus.
        const klaim = JSON.parse(
          localStorage.getItem(CLAIMS_KEY) || "[]"
        );

        const nomorHapus = String(
          item.whatsappAsli || item.kontak
        ).replace(/[\s\-+()]/g, "");

        const klaimBaru = klaim.filter((data) => {
          const nomorData = String(data.whatsapp || "").replace(
            /[\s\-+()]/g,
            ""
          );

          return nomorData !== nomorHapus;
        });

        localStorage.setItem(CLAIMS_KEY, JSON.stringify(klaimBaru));

        window.dispatchEvent(new Event("surplus-claims-updated"));
      }

      setPengguna(bacaDataPengguna());
      setPesan("Data pengguna berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus data pengguna:", error);
      setPesan("Gagal menghapus data pengguna.");
    }
  };

  return (
    <div className="users-page">
      <header className="users-navbar">
        <Link to="/admin" className="users-brand">
          <div className="users-brand-icon">
            <LogoSurplus />
          </div>
          <span>Surplus</span>
        </Link>

        <nav className="users-nav">
          {menu.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`users-nav-link ${
                location.pathname === item.to ? "active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          <AdminProfile />
        </nav>
      </header>

      <section className="users-heading">
        <div className="users-heading-icon">
          <UserIcon />
        </div>

        <div>
          <h1>Kelola Data Pengguna</h1>
          <p>Kelola data pengguna dan search</p>
        </div>
      </section>

      <main className="users-main">
        <div className="users-toolbar">
          <label className="users-search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Cari data pengguna"
            />
          </label>
        </div>

        {pesan && (
          <p className="users-message" role="status">
            {pesan}
          </p>
        )}

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Kontak</th>
                <th>Peran</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {hasilPencarian.map((item) => (
                <tr key={item.id}>
                  <td>{item.nama}</td>
                  <td>
                    {item.email !== "-" ? (
                      <a href={`mailto:${item.email}`}>
                        {item.email}
                      </a>
                    ) : (
                      item.email
                    )}
                  </td>
                  <td>{item.kontak}</td>
                  <td>{item.peran}</td>
                  <td>{item.status}</td>
                  <td>
                    <div className="users-actions">
                      <button
                        type="button"
                        className="users-action-btn"
                        title="Edit pengguna"
                        aria-label={`Edit ${item.nama}`}
                        onClick={() => mulaiEdit(item)}
                      >
                        <EditIcon />
                      </button>

                      <button
                        type="button"
                        className="users-action-btn"
                        title="Hapus pengguna"
                        aria-label={`Hapus ${item.nama}`}
                        onClick={() => hapusPengguna(item)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {hasilPencarian.length === 0 && (
                <tr>
                  <td colSpan="6" className="users-empty">
                    Data pengguna tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {editId !== null && (
        <div className="users-modal-backdrop">
          <form className="users-modal" onSubmit={simpanEdit}>
            <h2>Edit Data Pengguna</h2>

            <label>
              Nama
              <input
                value={formEdit.nama || ""}
                onChange={(e) =>
                  setFormEdit({
                    ...formEdit,
                    nama: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={formEdit.email === "-" ? "" : formEdit.email || ""}
                onChange={(e) =>
                  setFormEdit({
                    ...formEdit,
                    email: e.target.value,
                  })
                }
                required={formEdit.sumber === "akun"}
              />
            </label>

            <label>
              Kontak
              <input
                value={formEdit.kontak || ""}
                onChange={(e) =>
                  setFormEdit({
                    ...formEdit,
                    kontak: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Peran
              <select
                value={formEdit.peran || "Mitra"}
                onChange={(e) =>
                  setFormEdit({
                    ...formEdit,
                    peran: e.target.value,
                  })
                }
                disabled={formEdit.sumber === "klaim"}
              >
                <option value="Admin">Admin</option>
                <option value="Mitra">Mitra</option>
                <option value="Penerima">Penerima</option>
              </select>
            </label>

            <label>
              Status
              <select
                value={formEdit.status || "Aktif"}
                onChange={(e) =>
                  setFormEdit({
                    ...formEdit,
                    status: e.target.value,
                  })
                }
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </label>

            <div className="users-modal-actions">
              <button type="button" onClick={() => setEditId(null)}>
                Batal
              </button>
              <button type="submit">Simpan</button>
            </div>
          </form>
        </div>
      )}

      <footer className="users-footer">
        © 2026 Surplus - Platform Distribusi Makanan Berlebih.
      </footer>
    </div>
  );
}

export default DataPengguna;
