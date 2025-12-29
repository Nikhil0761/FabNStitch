import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './CustomerDashboard.css';

import { API_URL } from '../config';

function CustomerDashboard() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [measurements, setMeasurements] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('fabnstitch_token');

useEffect(() => {
  if (!token) {
    navigate('/login');
    return;
  }
  fetchDashboardData();
}, [token, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/customer/dashboard`, {
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
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setUser(data.user);
      setStats(data.stats);
      setRecentOrders(data.recentOrders);

      const measurementsRes = await fetch(`${API_URL}/customer/measurements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (measurementsRes.ok) {
        const measurementsData = await measurementsRes.json();
              setMeasurements(measurementsData);

      }

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      stitching: 'status-stitching',
      finishing: 'status-finishing',
      quality_check: 'status-quality',
      ready: 'status-ready',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return classes[status] || 'status-pending';
  };

  // Show loading inside the layout
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="dashboard-content-loading">
          <div className="loader"></div>
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="dashboard-content-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">Retry</button>
        </div>
      </DashboardLayout>
    );
  }
console.log("Measurements state:", measurements);

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Here's what's happening with your orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats?.totalOrders || 0}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats?.activeOrders || 0}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats?.completedOrders || 0}</span>
              <span className="stat-label">Delivered</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats?.readyOrders || 0}</span>
              <span className="stat-label">Ready/Shipped</span>
            </div>
          </div>
        </div>

        {/* Recent Orders & Measurements */}
        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent Orders</h2>
              <Link to="/customer/orders" className="view-all-link">View All →</Link>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="orders-list">
                {recentOrders.map(order => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <span className="order-id">{order.order_id}</span>
                      <span className="order-style">{order.style}</span>
                      <span className="order-fabric">{order.fabric_name} - {order.fabric_color}</span>
                    </div>
                    <div className="order-meta">
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                      <span className="order-price">₹{order.price?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No orders yet</p>
                <Link to="/#get-started" className="btn btn-primary">Place Your First Order</Link>
              </div>
            )}
          </div>

          {/* Measurements */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Your Measurements</h2>
            </div>
            
            {measurements && measurements.chest !== null ? (
  <div className="measurements-grid">
    <div className="measurement-item">
      <span className="measurement-label">Chest</span>
      <span className="measurement-value">{measurements.chest}"</span>
    </div>

    <div className="measurement-item">
      <span className="measurement-label">Waist</span>
      <span className="measurement-value">{measurements.waist}"</span>
    </div>

    <div className="measurement-item">
      <span className="measurement-label">Shoulders</span>
      <span className="measurement-value">{measurements.shoulders}"</span>
    </div>

    <div className="measurement-item">
      <span className="measurement-label">Arm Length</span>
      <span className="measurement-value">{measurements.arm_length}"</span>
    </div>

    <div className="measurement-item">
      <span className="measurement-label">Jacket Length</span>
      <span className="measurement-value">{measurements.jacket_length}"</span>
    </div>

    <div className="measurement-item">
      <span className="measurement-label">Neck</span>
      <span className="measurement-value">{measurements.neck}"</span>
    </div>
  </div>
) : (
  <div className="empty-state">
    <p>No measurements recorded yet</p>
    <p className="empty-hint">
      Our tailor will take your measurements during your appointment
    </p>
  </div>
)}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CustomerDashboard;