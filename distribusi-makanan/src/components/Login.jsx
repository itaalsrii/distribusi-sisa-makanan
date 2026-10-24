
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const username = form.username.trim().toLowerCase();
    const password = form.password;

    if (!username || !password) {
      setError("Username/email dan password wajib diisi.");
      return;
    }

    // Akun Admin bawaan
    if (username === "admin" && password === "Admin123!") {
      localStorage.setItem(
        "surplus_session",
        JSON.stringify({
          username: "admin",
          nama: "Admin Surplus",
          role: "admin",
        })
      );

      navigate("/admin");
      return;
    }

    // Ambil akun Mitra yang sudah terdaftar
    let accounts = [];

    try {
      accounts = JSON.parse(
        localStorage.getItem("surplus_accounts") || "[]"
      );
    } catch {
      setError("Data akun tidak dapat dibaca.");
      return;
    }

    if (!Array.isArray(accounts)) {
      setError("Data akun tidak valid.");
      return;
    }

    const account = accounts.find(
      (item) =>
        item.role === "mitra" &&
        (
          item.username?.toLowerCase() === username ||
          item.email?.toLowerCase() === username
        ) &&
        item.password === password
    );

    if (!account) {
      setError("Username/email atau password salah.");
      return;
    }

    localStorage.setItem(
      "surplus_session",
      JSON.stringify({
        username: account.username,
        nama: account.namaPemilik,
        namaUsaha: account.namaUsaha,
        role: "mitra",
      })
    );

    navigate("/mitra");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 48 48" fill="none">
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
          </div>

          <h1 className="login-brand">Surplus</h1>
          <p className="login-title">MASUK KE AKUN</p>
          <p className="login-subtitle">
            Masuk untuk melanjutkan ke Surplus
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username atau Email</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Masukkan username atau email"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? "◉" : "◎"}
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-login">
            Masuk
          </button>
        </form>

        <p className="login-footer">
          Belum punya akun Mitra?{" "}
          <Link to="/register">Daftar Sekarang</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
