/* ============================================
   Tailor Dashboard Page - Work-Focused View
   ============================================ */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TailorLayout from '../components/TailorLayout';
import './TailorDashboard.css';

const API_URL = 'http://localhost:5000/api';

function TailorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [stats, setStats] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data.stats);
      setPendingOrders(data.pendingOrders || []);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick status update without modal
  const handleQuickStatusUpdate = async (orderId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;

    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`${API_URL}/tailor/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: nextStatus,
          notes: `Moved to ${formatStatus(nextStatus)}`
        })
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      confirmed: 'stitching',
      stitching: 'finishing'
    };
    return flow[currentStatus];
  };

  const formatStatus = (status) => {
    const labels = {
      confirmed: 'Confirmed',
      stitching: 'Stitching',
      finishing: 'Finishing',
      quality_check: 'QC',
      ready: 'Ready',
      shipped: 'Shipped',
      delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      confirmed: 'status-confirmed',
      stitching: 'status-stitching',
      finishing: 'status-finishing',
      quality_check: 'status-quality',
      ready: 'status-ready'
    };
    return classes[status] || 'status-pending';
  };

  const getProgressPercent = (status) => {
    const progress = {
      confirmed: 33,
      stitching: 66,
      finishing: 100
    };
    return progress[status] || 0;
  };

  // Calculate urgency based on due date
  const getUrgency = (dueDate) => {
    if (!dueDate) return 'normal';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 2) return 'soon';
    return 'normal';
  };

  const getUrgencyLabel = (urgency) => {
    const labels = {
      overdue: '🔴 OVERDUE',
      today: '🟠 DUE TODAY',
      soon: '🟡 Due Soon',
      normal: ''
    };
    return labels[urgency];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Group orders by urgency
  const groupedOrders = {
    urgent: pendingOrders.filter(o => ['overdue', 'today'].includes(getUrgency(o.estimated_delivery))),
    normal: pendingOrders.filter(o => !['overdue', 'today'].includes(getUrgency(o.estimated_delivery)))
  };

  if (isLoading) {
    return (
      <TailorLayout>
        <div className="dashboard-loading">
          <div className="loader"></div>
          <p>Loading your work...</p>
        </div>
      </TailorLayout>
    );
  }

  if (error) {
    return (
      <TailorLayout>
        <div className="dashboard-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">Retry</button>
        </div>
      </TailorLayout>
    );
  }

  const totalInProgress = (stats?.confirmed || 0) + (stats?.stitching || 0) + (stats?.finishing || 0);

  return (
    <TailorLayout>
      <div className="tailor-dashboard">
        {/* Quick Stats Bar */}
        <div className="quick-stats-bar">
          <div className="quick-stat">
            <span className="qs-number">{totalInProgress}</span>
            <span className="qs-label">In Progress</span>
          </div>
          <div className="quick-stat highlight">
            <span className="qs-number">{groupedOrders.urgent.length}</span>
            <span className="qs-label">Need Attention</span>
          </div>
          <div className="quick-stat">
            <span className="qs-number">{stats?.finishing || 0}</span>
            <span className="qs-label">Finishing</span>
          </div>
          <div className="quick-stat success">
            <span className="qs-number">{stats?.todayUpdates || 0}</span>
            <span className="qs-label">Done Today</span>
          </div>
        </div>

        {/* Workflow Progress - 3 Stages */}
        <div className="workflow-progress">
          <div className="workflow-stage">
            <div className="stage-count">{stats?.confirmed || 0}</div>
            <div className="stage-label">Confirmed</div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-stage active">
            <div className="stage-count">{stats?.stitching || 0}</div>
            <div className="stage-label">Stitching</div>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-stage done">
            <div className="stage-count">{stats?.finishing || 0}</div>
            <div className="stage-label">Finishing</div>
          </div>
        </div>

        {/* Urgent Orders Section */}
        {groupedOrders.urgent.length > 0 && (
          <div className="urgent-section">
            <div className="section-header urgent">
              <h2>⚡ Needs Attention ({groupedOrders.urgent.length})</h2>
            </div>
            <div className="work-cards">
              {groupedOrders.urgent.map(order => (
                <WorkCard 
                  key={order.id}
                  order={order}
                  urgency={getUrgency(order.estimated_delivery)}
                  onStatusUpdate={handleQuickStatusUpdate}
                  isUpdating={updatingOrderId === order.order_id}
                  formatDate={formatDate}
                  formatStatus={formatStatus}
                  getStatusClass={getStatusClass}
                  getProgressPercent={getProgressPercent}
                  getNextStatus={getNextStatus}
                  getUrgencyLabel={getUrgencyLabel}
                />
              ))}
            </div>
          </div>
        )}

        {/* Normal Orders */}
        <div className="work-section">
          <div className="section-header">
            <h2>📋 Work Queue ({groupedOrders.normal.length})</h2>
            <Link to="/tailor/orders" className="view-all-link">All Orders →</Link>
          </div>
          
          {groupedOrders.normal.length === 0 && groupedOrders.urgent.length === 0 ? (
            <div className="empty-queue">
              <div className="empty-icon">🎉</div>
              <h3>All Clear!</h3>
              <p>No pending work. Great job!</p>
            </div>
          ) : groupedOrders.normal.length === 0 ? (
            <div className="empty-queue small">
              <p>All remaining orders need urgent attention above ☝️</p>
            </div>
          ) : (
            <div className="work-cards">
              {groupedOrders.normal.map(order => (
                <WorkCard 
                  key={order.id}
                  order={order}
                  urgency={getUrgency(order.estimated_delivery)}
                  onStatusUpdate={handleQuickStatusUpdate}
                  isUpdating={updatingOrderId === order.order_id}
                  formatDate={formatDate}
                  formatStatus={formatStatus}
                  getStatusClass={getStatusClass}
                  getProgressPercent={getProgressPercent}
                  getNextStatus={getNextStatus}
                  getUrgencyLabel={getUrgencyLabel}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </TailorLayout>
  );
}

// Work Card Component - Optimized for tailors
function WorkCard({ 
  order, 
  urgency, 
  onStatusUpdate, 
  isUpdating,
  formatDate,
  formatStatus,
  getStatusClass,
  getProgressPercent,
  getNextStatus,
  getUrgencyLabel
}) {
  const nextStatus = getNextStatus(order.status);
  const urgencyLabel = getUrgencyLabel(urgency);

  return (
    <div className={`work-card ${urgency}`}>
      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${getProgressPercent(order.status)}%` }}
        />
      </div>
      
      {/* Card Header */}
      <div className="work-card-header">
        <div className="order-info">
          <span className="order-id">{order.order_id}</span>
          {urgencyLabel && <span className={`urgency-badge ${urgency}`}>{urgencyLabel}</span>}
        </div>
        <span className={`status-chip ${getStatusClass(order.status)}`}>
          {formatStatus(order.status)}
        </span>
      </div>

      {/* Main Content - What Tailor Needs */}
      <div className="work-card-content">
        {/* Style & Fabric - Most Important */}
        <div className="main-info">
          <h3 className="style-name">{order.style}</h3>
          <p className="fabric-details">
            {order.fabric_name} • {order.fabric_color}
          </p>
        </div>

        {/* Customer + Due Date Row */}
        <div className="meta-row">
          <div className="customer-mini">
            <span className="customer-name">{order.customer_name}</span>
          </div>
          <div className="due-info">
            <span className="due-label">Due:</span>
            <span className={`due-date ${urgency}`}>{formatDate(order.estimated_delivery)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="work-card-footer">
        {/* Quick Contact */}
        <div className="quick-contact">
          <a 
            href={`tel:${order.customer_phone}`} 
            className="contact-btn call"
            onClick={(e) => e.stopPropagation()}
            title="Call Customer"
          >
            📞
          </a>
          <a 
            href={`https://wa.me/91${order.customer_phone?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-btn whatsapp"
            onClick={(e) => e.stopPropagation()}
            title="WhatsApp"
          >
            💬
          </a>
          <Link 
            to={`/tailor/orders?id=${order.order_id}`}
            className="contact-btn details"
            onClick={(e) => e.stopPropagation()}
            title="View Details"
          >
            📋
          </Link>
        </div>

        {/* Quick Status Update */}
        {nextStatus && (
          <button
            className="quick-update-btn"
            onClick={(e) => {
              e.stopPropagation();
              onStatusUpdate(order.order_id, order.status);
            }}
            disabled={isUpdating}
          >
            {isUpdating ? '...' : `→ ${formatStatus(nextStatus)}`}
          </button>
        )}
      </div>
    </div>
  );
}

export default TailorDashboard;
