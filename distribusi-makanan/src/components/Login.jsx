import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

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

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


const handleSubmit = (e) => {
  e.preventDefault();

  const accounts = JSON.parse(
    localStorage.getItem("surplus_accounts") || "[]"
  );

  const username = form.username.trim();

  const account = accounts.find(
    (item) =>
      item.username.toLowerCase() === username.toLowerCase() &&
      item.password === form.password
  );

  if (!account) {
    setError("Username atau password salah. Silakan coba lagi.");
    return;
  }

  setError("");
  alert(`Login berhasil! Selamat datang, ${account.namaPemilik}.`);
};


  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        {/* Logo dan judul */}
        <div className="login-header">
          <div className="login-logo">
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
              <rect
                x="8"
                y="49"
                width="48"
                height="5"
                rx="2.5"
                fill="#fff"
              />
            </svg>
          </div>

          <h1 className="login-brand">Surplus</h1>
          <h2 className="login-title">SILAKAN MASUK</h2>
          <p className="login-subtitle">Login Admin/Mitra</p>
        </div>

        {/* Form login */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Masukan Username Anda"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukan Password Anda"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"
              }
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-login">Login</button>

<p className="login-footer">
  Belum punya akun? <Link to="/register">Daftar Sekarang</Link>
</p>
      </form>
    </div>
  );
}

export default Login;
