import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "./Auth.css";


// Simple SVG Icons
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const EyeIcon = ({ visible, onClick }) => (
  <svg
    onClick={onClick}
    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="password-toggle"
  >
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </>
    )}
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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

      console.log("Login success:", data); // Debugging

      localStorage.setItem("fabnstitch_token", data.token);
      localStorage.setItem("fabnstitch_user", JSON.stringify(data.user));

if (data.user.role === "admin") {
  navigate("/admin/create-order");
} else if (data.user.role === "customer") {
  navigate("/customer/dashboard");
} else if (data.user.role === "tailor") {
  navigate("/tailor/dashboard");
}

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel: Sign In Form */}
      <div className="auth-panel dark">
        <h1 className="auth-title">Sign In</h1>

        <button className="btn-google">
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p style={{ color: "#ff6b6b", fontSize: "0.9rem", textAlign: "center", margin: 0 }}>{error}</p>}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              className="auth-input"
              name="email"
              placeholder="you@company.com"
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
            <EyeIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
          </div>

          <Link to="/forgot-password" className="forgot-password">Forgot your password?</Link>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
            {!loading && <ArrowRight />}
          </button>
        </form>
      </div>

      {/* Right Panel: Sign Up Promo */}
      <div className="auth-panel light">
        <div className="circle-decoration c1"></div>
        <div className="circle-decoration c2"></div>
        <div className="circle-decoration c3"></div>

        <h1 className="auth-title" style={{ fontFamily: 'Playfair Display, serif' }}>Hey There!</h1>
        <p className="auth-subtitle">
          Begin an amazing journey by creating an account with us today
        </p>

        <Link to="/register" className="btn-outline">
          Sign Up
        </Link>
<Link to="/admin" className="btn-outline">
  Admin
</Link>

      </div>
    </div>
  );
}

export default Login;
