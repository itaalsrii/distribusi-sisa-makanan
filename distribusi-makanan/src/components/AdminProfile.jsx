
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css";

function AdminProfile() {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setMenuTerbuka(false);
    navigate("/");
  };

  return (
    <div className="admin-profile-wrapper">
      <button
        type="button"
        className="admin-profile"
        onClick={() => setMenuTerbuka(!menuTerbuka)}
        aria-expanded={menuTerbuka}
      >

<span className="admin-avatar">
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="8"
      r="4"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M4 21C4 16.6 7.6 14 12 14C16.4 14 20 16.6 20 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
</span>

        <span>Admin</span>
      </button>

      {menuTerbuka && (
        <div className="admin-dropdown">
          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminProfile;
