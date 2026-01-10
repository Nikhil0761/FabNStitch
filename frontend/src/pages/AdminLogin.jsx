import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "./Auth.css";

/* ================= ICONS ================= */

const EyeIcon = ({ visible, onClick }) => (
  <svg
    onClick={onClick}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="password-toggle"
  >
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ================= ADMIN LOGIN ================= */

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // ❗ Allow only admin
      if (data.user.role !== "admin") {
        throw new Error("Access denied. Admin only.");
      }

      localStorage.setItem("fabnstitch_token", data.token);
      localStorage.setItem("fabnstitch_user", JSON.stringify(data.user));

      navigate("/admin/create-order");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      
      {/* LEFT PANEL */}
      <div className="auth-panel dark">
        <h1 className="auth-title">Admin Sign In</h1>

        <div className="divider">
          <span>secure admin access</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <p style={{ color: "#ff6b6b", fontSize: "0.9rem", textAlign: "center" }}>
              {error}
            </p>
          )}

          <div className="input-group">
            <label className="input-label">Admin Email</label>
            <input
              className="auth-input"
              name="email"
              placeholder="admin@fabnstitch.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              className="auth-input"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
            <EyeIcon
              visible={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Signing In..." : "Admin Login"}
            {!loading && <ArrowRight />}
          </button>
        </form>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-panel light">
        <div className="circle-decoration c1"></div>
        <div className="circle-decoration c2"></div>
        <div className="circle-decoration c3"></div>

        <h1 className="auth-title">FabNStitch Admin</h1>
        <p className="auth-subtitle">
          Manage orders, customers, tailors & production securely
        </p>

        <Link to="/login" className="btn-outline">
          Back to User Login
        </Link>
      </div>
    </div>
  );
}

export default AdminLogin;
