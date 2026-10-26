
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
import DataPenggunaAdmin from "./components/DataPenggunaAdmin";
import DataMakananAdmin from "./components/DataMakananAdmin";
import LaporanAdmin from "./components/LaporanAdmin";
import DashboardMitra from "./components/DashboardMitra";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Penerima />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/pengguna" element={<DataPenggunaAdmin />} />
        <Route path="/admin/makanan" element={<DataMakananAdmin />} />
        <Route path="/admin/laporan" element={<LaporanAdmin />} />
        <Route path="/mitra" element={<DashboardMitra />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
