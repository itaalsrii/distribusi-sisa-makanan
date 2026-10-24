
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Penerima from "./components/Penerima";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardMitra from "./components/DashboardMitra";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman utama langsung menampilkan Penerima */}
        <Route path="/" element={<Penerima />} />

        {/* Login dan registrasi akun Mitra/Admin */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard berdasarkan peran */}
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/mitra" element={<DashboardMitra />} />

        {/* Jika alamat tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
