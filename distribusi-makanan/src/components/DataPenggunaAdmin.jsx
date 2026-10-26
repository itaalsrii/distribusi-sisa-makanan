import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DataPenggunaAdmin.css";
import AdminProfile from "./AdminProfile";

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

function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 12 6Zm0 13a7 7 0 0 1-5.5-2.7c.1-2.1 3.7-3.3 5.5-3.3s5.4 1.2 5.5 3.3A7 7 0 0 1 12 19Z" />
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
const [pengguna, setPengguna] = useState(() => {
  try {
    const accounts = JSON.parse(
      localStorage.getItem("surplus_accounts") || "[]"
    );

    return accounts.map((account, index) => ({
      id: account.id || index + 1,
      nama: account.namaPemilik || account.namaUsaha || "-",
      email: account.email || "-",
      kontak: account.noHp || "-",
      peran: account.role === "mitra" ? "Mitra" : account.role,
      status: account.status || "Aktif",
    }));
  } catch {
    return [];
  }
});

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

  const simpanEdit = (e) => {
    e.preventDefault();

    setPengguna((sebelumnya) =>
      sebelumnya.map((item) =>
        item.id === editId ? { ...formEdit } : item
      )
    );

    setEditId(null);
    setPesan("Data pengguna berhasil diperbarui.");
  };

  const hapusPengguna = (item) => {
    const yakin = window.confirm(
      `Apakah kamu yakin ingin menghapus ${item.nama}?`
    );

    if (!yakin) return;

    setPengguna((sebelumnya) =>
      sebelumnya.filter((data) => data.id !== item.id)
    );
    setPesan("Data pengguna berhasil dihapus.");
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
                    <a href={`mailto:${item.email}`}>
                      {item.email}
                    </a>
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
                value={formEdit.email || ""}
                onChange={(e) =>
                  setFormEdit({
                    ...formEdit,
                    email: e.target.value,
                  })
                }
                required
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
              >
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
