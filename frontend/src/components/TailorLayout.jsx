/* ============================================
   Tailor Layout Component
   ============================================
   Shared layout for all tailor dashboard pages
   ============================================ */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import './TailorLayout.css';

const API_URL = 'http://localhost:5000/api';

function TailorLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes('/orders')) return 'orders';
    if (location.pathname.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUser();
  }, [token, navigate]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/tailor/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data.tailor);
    } catch (err) {
      console.error('Auth error:', err);
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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

  if (isLoading) {
    return (
      <div className="tailor-loading">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="tailor-layout">
      {/* Tailor Header */}
      <header className="tailor-topbar">
        <div className="topbar-left">
          <Link to="/" className="tailor-logo">
            <img src={logo} alt="FabNStitch" />
          </Link>
          <span className="tailor-badge">Tailor Portal</span>
        </div>
        
        <div className="topbar-right">
          <div className="user-menu-wrapper">
            <button 
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-small tailor-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name-topbar">{user?.name?.split(' ')[0]}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/tailor/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  My Profile
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="tailor-sidebar">
        <div className="sidebar-user">
          <div className="user-avatar tailor-avatar-large">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <span className="role-badge">Tailor</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/tailor/dashboard" className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </Link>
          <Link to="/tailor/orders" className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            My Orders
          </Link>
          <Link to="/tailor/profile" className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </Link>
          <button onClick={handleLogout} className="sidebar-link logout-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="tailor-main">
        {children}
      </main>
    </div>
  );
}

export default TailorLayout;


