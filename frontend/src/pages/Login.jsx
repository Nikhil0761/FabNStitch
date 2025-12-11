/* ============================================
   Login Page Component
   ============================================
   
   📚 LEARNING: React Router & Forms
   
   Key concepts:
   - useNavigate() - programmatic navigation
   - useState() - managing form inputs
   - Form handling - controlled components
   - Link - React Router's anchor tag
   
   ============================================ */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Login.css';

function Login() {
  // Navigation hook - allows us to redirect after login
  const navigate = useNavigate();

  // Form state - stores input values
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Error state - for showing validation messages
  const [error, setError] = useState('');

  // Loading state - for button feedback
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Call backend API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on user role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'tailor') {
        navigate('/tailor/dashboard');
      } else {
        navigate('/customer/dashboard');
      }

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left side - Decorative */}
      <div className="auth-visual">
        <div className="auth-visual-content">
          <Link to="/" className="auth-logo">
            <img src={logo} alt="FabNStitch" />
          </Link>
          <div className="auth-visual-text">
            <h2>Welcome Back!</h2>
            <p>
              Sign in to track your orders, view your measurements, 
              and access exclusive features.
            </p>
          </div>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="feature-icon">📦</span>
              <span>Track Your Orders</span>
            </div>
            <div className="auth-feature">
              <span className="feature-icon">📏</span>
              <span>View Measurements</span>
            </div>
            <div className="auth-feature">
              <span className="feature-icon">⭐</span>
              <span>Write Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          {/* Mobile logo (hidden on desktop) */}
          <Link to="/" className="auth-logo-mobile">
            <img src={logo} alt="FabNStitch" />
          </Link>

          <div className="auth-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to access your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email or User ID</label>
              <div className="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Enter your email or user ID"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" />
                <span className="checkmark"></span>
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary btn-block ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          {/* OTP Login Option */}
          <button className="btn btn-outline btn-block btn-otp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Login with Mobile OTP
          </button>

          {/* Sign Up Link */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register">Contact Admin</Link>
            </p>
            <p className="auth-note">
              * Accounts are created by admin during home visits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

