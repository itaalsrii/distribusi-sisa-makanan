
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function EyeIcon({ open }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.8 19.8 0 0 1 5.06-5.94M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 7 11 7a19.8 19.8 0 0 1-3.17 4.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function PasswordField({ id, label, value, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>

      <div className="password-wrap">
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          placeholder="********"
          value={value}
          onChange={onChange}
          autoComplete={
            id === "password" ? "new-password" : "new-password"
          }
          required
        />

        <button
          type="button"
          className="toggle-eye"
          onClick={() => setShow(!show)}
          aria-label={show ? "Sembunyikan sandi" : "Tampilkan sandi"}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    namaUsaha: "",
    namaPemilik: "",
    username: "",
    email: "",
    noHp: "",
    alamat: "",
    password: "",
    konfirmasi: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const namaUsaha = form.namaUsaha.trim();
    const namaPemilik = form.namaPemilik.trim();
    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();

    // Validasi kolom
    if (
      !namaUsaha ||
      !namaPemilik ||
      !username ||
      !email ||
      !form.noHp.trim() ||
      !form.alamat.trim() ||
      !form.password ||
      !form.konfirmasi
    ) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    // Username admin tidak boleh digunakan Mitra
    if (username.toLowerCase() === "admin") {
      setError("Username tersebut tidak tersedia.");
      return;
    }

    // Validasi password
    if (form.password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    if (form.password !== form.konfirmasi) {
      setError("Konfirmasi sandi tidak sama dengan kata sandi.");
      return;
    }

    // Ambil data akun yang sudah terdaftar
    let accounts = [];

    try {
      accounts = JSON.parse(
        localStorage.getItem("surplus_accounts") || "[]"
      );
    } catch {
      setError("Data akun bermasalah. Silakan muat ulang halaman.");
      return;
    }

    if (!Array.isArray(accounts)) {
      setError("Data akun tidak valid.");
      return;
    }

    // Periksa username dan email yang sama
    const alreadyExists = accounts.some(
      (account) =>
        account.username?.toLowerCase() === username.toLowerCase() ||
        account.email?.toLowerCase() === email
    );

    if (alreadyExists) {
      setError("Username atau email sudah terdaftar.");
      return;
    }

const newAccount = {
  id: `mitra-${Date.now()}`,
  namaUsaha: form.namaUsaha,
  namaPemilik: form.namaPemilik,
  username: form.username.trim(),
  email: form.email.trim().toLowerCase(),
  noHp: form.noHp,
  alamat: form.alamat,
  password: form.password,
  role: "mitra",
  status: "Aktif",
};
    // Simpan akun
    try {
      localStorage.setItem(
        "surplus_accounts",
        JSON.stringify([...accounts, newAccount])
      );
    } catch {
      setError("Akun gagal disimpan. Periksa penyimpanan browser.");
      return;
    }

    alert(
      "Registrasi Mitra berhasil! Silakan login menggunakan username atau email dan kata sandi yang telah dibuat."
    );

    // Kembali ke halaman Login
    navigate("/");
  };

  return (
    <div className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <div className="register-header">
          <div className="register-logo">
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path
                d="M22 6c-3 3-3 6 0 9s3 6 0 9"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M32 4c-3 3-3 6 0 9s3 6 0 9"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M42 6c-3 3-3 6 0 9s3 6 0 9"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="32" cy="29" r="3" fill="#fff" />
              <path d="M13 46a19 19 0 0 1 38 0Z" fill="#fff" />
              <rect x="8" y="49" width="48" height="5" rx="2.5" fill="#fff" />
            </svg>
          </div>

          <h1 className="register-brand">Surplus</h1>
          <h2 className="register-title">SILAKAN REGISTRASI</h2>
        </div>

        <div className="form-group">
          <label htmlFor="namaUsaha">
            Nama Toko / Restoran / Usaha
          </label>
          <input
            id="namaUsaha"
            name="namaUsaha"
            type="text"
            placeholder="Contoh: Angkringan Tepi Danau"
            value={form.namaUsaha}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="namaPemilik">
            Nama Pemilik / Penanggung Jawab
          </label>
          <input
            id="namaPemilik"
            name="namaPemilik"
            type="text"
            placeholder="Nama Lengkap Sesuai KTP"
            value={form.namaPemilik}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Buat username Anda"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Usaha</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tepidanaunibos@gmail.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="noHp">No. WhatsApp / HP</label>
            <input
              id="noHp"
              name="noHp"
              type="tel"
              placeholder="082345678910"
              value={form.noHp}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="alamat">Alamat Lengkap Toko / Usaha</label>
          <input
            id="alamat"
            name="alamat"
            type="text"
            placeholder="Jl. Sudirman No 12, Kelurahan Sagulung"
            value={form.alamat}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <PasswordField
            id="password"
            label="Kata Sandi"
            value={form.password}
            onChange={handleChange}
          />

          <PasswordField
            id="konfirmasi"
            label="Konfirmasi Sandi"
            value={form.konfirmasi}
            onChange={handleChange}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-daftar">
          Daftar Sebagai Mitra
        </button>

        <p className="register-footer">
          Sudah punya akun? <Link to="/login">Masuk Sekarang</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
