/* ============================================
   Admin Layout Component
   ============================================
   Shared layout for all admin dashboard pages
   - Header with admin branding
   - Sidebar navigation for admin functions
   - Main content area
   ============================================ */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import './DashboardLayout.css';

import { API_URL } from '../config';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('fabnstitch_token');

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes('/create-order')) return 'create-order';
    if (location.pathname.includes('/create-user')) return 'create-user';
    if (location.pathname.includes('/orders')) return 'orders';
    if (location.pathname.includes('/users')) return 'users';
    if (location.pathname.includes('/tailors')) return 'tailors';
    if (location.pathname.includes('/support')) return 'support';
    if (location.pathname.includes('/leads')) return 'leads';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    
    // Verify admin role
    const storedUser = localStorage.getItem('fabnstitch_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== 'admin') {
        navigate('/login');
        return;
      }
      setUser(userData);
    }
    
    fetchAdminData();
  }, [token, navigate]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('fabnstitch_token');
          localStorage.removeItem('fabnstitch_user');
          navigate('/admin');
          return;
        }
        throw new Error('Failed to fetch admin data');
      }

      const data = await response.json();
      if (data.user.role !== 'admin') {
        navigate('/login');
        return;
      }
      setUser(data.user);
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fabnstitch_token');
    localStorage.removeItem('fabnstitch_user');
    navigate('/admin');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-wrapper')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout admin-layout">
      {/* Dashboard Header */}
      <header className="dashboard-topbar admin-topbar">
        <div className="topbar-left">
          {/* Mobile Menu Toggle */}
          <button
            className={`mobile-menu-toggle ${showMobileMenu ? 'active' : ''}`}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <Link to="/admin/dashboard" className="dashboard-logo">
            <img src={logo} alt="FabNStitch" />
            <span className="admin-badge">ADMIN</span>
          </Link>
          
          <Link to="/" className="back-to-site">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Website</span>
          </Link>
        </div>

        <div className="topbar-right">
          <div className="user-menu-wrapper">
            <button
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-small admin-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name-topbar">{user?.name?.split(' ')[0]}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                  <span className="admin-badge-small">Administrator</span>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                  View Website
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div className="mobile-overlay" onClick={() => setShowMobileMenu(false)} />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar admin-sidebar ${showMobileMenu ? 'mobile-open' : ''}`}>
        <div className="sidebar-user">
          <div className="user-avatar admin-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <span className="role-badge admin">Administrator</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>
          
          <Link to="/admin/orders" className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            All Orders
          </Link>

          <Link to="/admin/create-order" className={`sidebar-link ${activeTab === 'create-order' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Create Order
          </Link>
          
          <Link to="/admin/users" className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Customers
          </Link>

          <Link to="/admin/tailors" className={`sidebar-link ${activeTab === 'tailors' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Tailors
          </Link>

          <Link to="/admin/support" className={`sidebar-link ${activeTab === 'support' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Support Tickets
          </Link>

          <Link to="/admin/leads" className={`sidebar-link ${activeTab === 'leads' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <polyline points="17 11 19 13 23 9" />
            </svg>
            Website Leads
          </Link>

          <div className="sidebar-divider"></div>

          <button onClick={handleLogout} className="sidebar-link logout-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
