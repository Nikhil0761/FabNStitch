/* ============================================
   Customer Orders Page
   ============================================ */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import './CustomerOrders.css';

import { API_URL } from '../config';

function CustomerOrders() {
  const navigate = useNavigate();
  const token = localStorage.getItem('fabnstitch_token');

  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'stitching', label: 'Stitching' },
    { value: 'finishing', label: 'Finishing' },
    { value: 'quality_check', label: 'Quality Check' },
    { value: 'ready', label: 'Ready' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' }
  ];

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [token, navigate, filter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const url = filter === 'all' 
        ? `${API_URL}/customer/orders`
        : `${API_URL}/customer/orders?status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
console.log("Orders API response:", data);
setOrders(data.orders || []);
    } catch (err) {
      console.error('Orders error:', err);
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/customer/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.order);
        setOrderHistory(data.history || []);
        setShowOrderModal(true);
      }
    } catch (err) {
      console.error('Order details error:', err);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '📋',
      confirmed: '✓',
      stitching: '🧵',
      finishing: '✨',
      quality_check: '🔍',
      ready: '📦',
      shipped: '🚚',
      delivered: '🎉',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  };

  return (
    <DashboardLayout>
      <div className="orders-page">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>My Orders</h1>
            <p>View and track all your orders</p>
          </div>
          <Link to="/customer/new-order" className="btn btn-primary">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Order
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {statusOptions.map(option => (
            <button
              key={option.value}
              className={`filter-tab ${filter === option.value ? 'active' : ''}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Orders Content */}
        {isLoading ? (
          <div className="orders-loading">
            <div className="loader"></div>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="orders-error">
            <p>{error}</p>
            <button onClick={fetchOrders} className="btn btn-primary">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't placed any orders yet."
                : `No orders with status "${formatStatus(filter)}".`}
            </p>
            <Link to="/#get-started" className="btn btn-primary">Place Your First Order</Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order.id} className="order-card" onClick={() => fetchOrderDetails(order.order_id)}>
                <div className="order-card-header">
                  <div className="order-id-badge">
                    <span className="order-id">{order.order_id}</span>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {getStatusIcon(order.status)} {formatStatus(order.status)}
                    </span>
                  </div>
                  <span className="order-price">₹{order.price?.toLocaleString()}</span>
                </div>
                
                <div className="order-card-body">
                  <h3 className="order-style">{order.style}</h3>
                  {order.fabric_name && (
  <p className="order-fabric">
    {order.fabric_name}
    {order.fabric_color && ` - ${order.fabric_color}`}
  </p>
)}

                  {order.fabric_material && (
                    <p className="order-material">{order.fabric_material}</p>
                  )}
                </div>
                
                <div className="order-card-footer">
                  <div className="order-dates">
                    <div className="date-item">
                      <span className="date-label">Ordered</span>
                      <span className="date-value">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Est. Delivery</span>
                      <span className="date-value">{formatDate(order.estimated_delivery)}</span>
                    </div>
                  </div>
                  <button className="view-details-btn">
                    View Details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order Details</h2>
                <button className="modal-close" onClick={() => setShowOrderModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <div className="modal-body">
                {/* Order Summary */}
                <div className="modal-section">
                  <div className="order-summary-header">
                    <span className="modal-order-id">{selectedOrder.order_id}</span>
                    <span className={`status-badge large ${getStatusClass(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)} {formatStatus(selectedOrder.status)}
                    </span>
                  </div>
                  
                  <div className="order-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Style</span>
                      <span className="detail-value">{selectedOrder.style}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fabric</span>
                      <span className="detail-value">{selectedOrder.fabric_name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Color</span>
                      <span className="detail-value">{selectedOrder.fabric_color}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Material</span>
                      <span className="detail-value">{selectedOrder.fabric_material || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Order Date</span>
                      <span className="detail-value">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Est. Delivery</span>
                      <span className="detail-value">{formatDate(selectedOrder.estimated_delivery)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tailor</span>
                      <span className="detail-value">{selectedOrder.tailor_name || 'Assigned Soon'}</span>
                    </div>
                    <div className="detail-item highlight">
                      <span className="detail-label">Total Price</span>
                      <span className="detail-value price">₹{selectedOrder.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Measurements Used */}
                {selectedOrder.chest && (
                  <div className="modal-section">
                    <h3>Measurements Used</h3>
                    <div className="measurements-mini-grid">
                      <div className="measure-item">
                        <span>Chest</span>
                        <strong>{selectedOrder.chest}"</strong>
                      </div>
                      <div className="measure-item">
                        <span>Waist</span>
                        <strong>{selectedOrder.waist}"</strong>
                      </div>
                      <div className="measure-item">
                        <span>Shoulders</span>
                        <strong>{selectedOrder.shoulders}"</strong>
                      </div>
                      <div className="measure-item">
                        <span>Arm Length</span>
                        <strong>{selectedOrder.arm_length}"</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Timeline */}
                {orderHistory.length > 0 && (
                  <div className="modal-section">
                    <h3>Order Timeline</h3>
                    <div className="order-timeline">
                      {orderHistory.map((item, index) => (
                        <div key={index} className={`timeline-item ${index === 0 ? 'current' : ''}`}>
                          <div className="timeline-dot">
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="timeline-status">{formatStatus(item.status)}</span>
                              <span className="timeline-date">{formatDate(item.created_at)}</span>
                            </div>
                            {item.notes && <p className="timeline-note">{item.notes}</p>}
                            {item.updated_by_name && (
                              <span className="timeline-by">by {item.updated_by_name}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {selectedOrder.delivery_address && (
                  <div className="modal-section">
                    <h3>Delivery Address</h3>
                    <p className="delivery-address">{selectedOrder.delivery_address}</p>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setShowOrderModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CustomerOrders;
