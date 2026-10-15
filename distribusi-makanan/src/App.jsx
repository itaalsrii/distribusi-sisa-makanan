
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Penerima from "./components/Penerima";
import Login from "./components/Login";
import Register from "./components/Register";
import DashboardMitra from "./components/DashboardMitra";
import DashboardAdmin from "./components/DashboardAdmin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Penerima />} />
        <Route path="/penerima" element={<Penerima />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard-mitra"
          element={<DashboardMitra />}
        />
        <Route
          path="/dashboard-admin"
          element={<DashboardAdmin />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;