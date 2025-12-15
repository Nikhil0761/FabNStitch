/* ============================================
   Tailor Orders Page - Kanban with Drag & Drop
   ============================================ */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TailorLayout from '../components/TailorLayout';
import './TailorOrders.css';

import { API_URL } from '../config';

function TailorOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem('token');
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateNote, setUpdateNote] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Drag and Drop State
  const [draggedOrder, setDraggedOrder] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Kanban columns - 3 stages for tailor
  const kanbanColumns = [
    { key: 'confirmed', label: 'Confirmed', icon: '✓', color: '#3b82f6' },
    { key: 'stitching', label: 'Stitching', icon: '🧵', color: '#10b981' },
    { key: 'finishing', label: 'Finishing', icon: '✨', color: '#f59e0b' }
  ];

  // Valid transitions - which columns can accept drops from which
  const validTransitions = {
    confirmed: ['stitching'],
    stitching: ['confirmed', 'finishing'],
    finishing: ['stitching']
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
    
    const orderId = searchParams.get('id');
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/tailor/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Orders error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/tailor/orders/${orderId}`, {
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

  const handleStatusUpdate = async (orderId, newStatus, note = '') => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/tailor/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: note || `Moved to ${formatStatus(newStatus)}`
        })
      });

      if (!response.ok) throw new Error('Failed to update status');

      setMessage({ type: 'success', text: `Order moved to ${formatStatus(newStatus)}!` });
      setUpdateNote('');
      fetchOrders();
      
      if (selectedOrder?.order_id === orderId) {
        fetchOrderDetails(orderId);
      }
      
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  // ============================================
  // DRAG AND DROP HANDLERS
  // ============================================
  
  const handleDragStart = (e, order) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', order.order_id);
    // Add dragging class after a short delay for visual feedback
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedOrder(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnKey) => {
    e.preventDefault();
    
    if (!draggedOrder) return;
    
    // Check if this is a valid drop target
    const canDrop = validTransitions[draggedOrder.status]?.includes(columnKey);
    
    if (canDrop) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverColumn(columnKey);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedOrder) return;
    
    // Check if this is a valid transition
    const canDrop = validTransitions[draggedOrder.status]?.includes(targetStatus);
    
    if (canDrop && draggedOrder.status !== targetStatus) {
      await handleStatusUpdate(draggedOrder.order_id, targetStatus, `Dragged to ${formatStatus(targetStatus)}`);
    }
    
    setDraggedOrder(null);
  };

  const formatStatus = (status) => {
    const labels = {
      confirmed: 'Confirmed', stitching: 'Stitching', finishing: 'Finishing',
      quality_check: 'Quality Check', ready: 'Ready', shipped: 'Shipped', delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getUrgency = (dueDate) => {
    if (!dueDate) return 'normal';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 2) return 'soon';
    return 'normal';
  };

  // Group orders by status for Kanban
  const ordersByStatus = kanbanColumns.reduce((acc, col) => {
    acc[col.key] = orders.filter(o => o.status === col.key);
    return acc;
  }, {});

  // Check if a column can receive the dragged order
  const canReceiveDrop = (columnKey) => {
    if (!draggedOrder) return false;
    return validTransitions[draggedOrder.status]?.includes(columnKey);
  };

  if (isLoading) {
    return (
      <TailorLayout>
        <div className="orders-loading">
          <div className="loader"></div>
          <p>Loading orders...</p>
        </div>
      </TailorLayout>
    );
  }

  return (
    <TailorLayout>
      <div className="tailor-orders-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>My Orders</h1>
            <p>{orders.length} orders assigned to you • <span className="drag-hint">Drag cards to move between stages</span></p>
          </div>
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              ▦ Board
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰ List
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </div>
        )}

        {/* Kanban Board View with Drag & Drop */}
        {viewMode === 'kanban' && (
          <div className="kanban-board">
            {kanbanColumns.map(column => (
              <div 
                key={column.key} 
                className={`kanban-column ${dragOverColumn === column.key ? 'drag-over' : ''} ${canReceiveDrop(column.key) ? 'can-drop' : ''}`}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.key)}
              >
                <div className="column-header" style={{ borderColor: column.color }}>
                  <span className="column-icon">{column.icon}</span>
                  <span className="column-title">{column.label}</span>
                  <span className="column-count">{ordersByStatus[column.key]?.length || 0}</span>
                </div>
                <div className="column-cards">
                  {ordersByStatus[column.key]?.map(order => (
                    <KanbanCard
                      key={order.id}
                      order={order}
                      urgency={getUrgency(order.estimated_delivery)}
                      onViewDetails={() => fetchOrderDetails(order.order_id)}
                      formatDate={formatDate}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedOrder?.order_id === order.order_id}
                    />
                  ))}
                  {ordersByStatus[column.key]?.length === 0 && (
                    <div className="empty-column">
                      {draggedOrder && canReceiveDrop(column.key) 
                        ? '📥 Drop here' 
                        : 'No orders'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="list-view">
            {orders.length === 0 ? (
              <div className="orders-empty">
                <p>No orders assigned</p>
              </div>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Style / Fabric</th>
                    <th>Status</th>
                    <th>Due</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const urgency = getUrgency(order.estimated_delivery);
                    const nextStatus = validTransitions[order.status]?.[0];
                    return (
                      <tr key={order.id} className={urgency}>
                        <td>
                          <span className="order-id-cell">{order.order_id}</span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <span>{order.customer_name}</span>
                            <a href={`tel:${order.customer_phone}`} className="phone-link">
                              {order.customer_phone}
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="style-cell">
                            <strong>{order.style}</strong>
                            <span>{order.fabric_name} - {order.fabric_color}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill status-${order.status.replace('_', '-')}`}>
                            {formatStatus(order.status)}
                          </span>
                        </td>
                        <td className={`due-cell ${urgency}`}>
                          {formatDate(order.estimated_delivery)}
                        </td>
                        <td>
                          <div className="action-cell">
                            <button 
                              className="action-btn view"
                              onClick={() => fetchOrderDetails(order.order_id)}
                            >
                              View
                            </button>
                            {nextStatus && (
                              <button 
                                className="action-btn move"
                                onClick={() => handleStatusUpdate(order.order_id, nextStatus)}
                                disabled={isUpdating}
                              >
                                → {formatStatus(nextStatus)}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{selectedOrder.order_id}</h2>
                  <span className={`modal-status status-${selectedOrder.status.replace('_', '-')}`}>
                    {formatStatus(selectedOrder.status)}
                  </span>
                </div>
                <button className="modal-close" onClick={() => setShowOrderModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                {/* Quick Update */}
                {validTransitions[selectedOrder.status]?.length > 0 && (
                  <div className="quick-update-section">
                    <input
                      type="text"
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      placeholder="Add note (optional)"
                      className="update-note-input"
                    />
                    <button
                      className="big-update-btn"
                      onClick={() => handleStatusUpdate(selectedOrder.order_id, validTransitions[selectedOrder.status][0], updateNote)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Updating...' : `Move to ${formatStatus(validTransitions[selectedOrder.status][0])}`}
                    </button>
                  </div>
                )}

                {/* Order Info Grid */}
                <div className="info-section">
                  <h3>📋 Order Details</h3>
                  <div className="info-grid">
                    <div className="info-box">
                      <label>Style</label>
                      <span>{selectedOrder.style}</span>
                    </div>
                    <div className="info-box">
                      <label>Fabric</label>
                      <span>{selectedOrder.fabric_name}</span>
                    </div>
                    <div className="info-box">
                      <label>Color</label>
                      <span>{selectedOrder.fabric_color}</span>
                    </div>
                    <div className="info-box">
                      <label>Due Date</label>
                      <span className={getUrgency(selectedOrder.estimated_delivery)}>
                        {formatDate(selectedOrder.estimated_delivery)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Info with Contact */}
                <div className="info-section">
                  <h3>👤 Customer</h3>
                  <div className="customer-detail-card">
                    <div className="customer-info">
                      <strong>{selectedOrder.customer_name}</strong>
                      {selectedOrder.customer_city && <span>📍 {selectedOrder.customer_city}</span>}
                    </div>
                    <div className="customer-contact-btns">
                      <a href={`tel:${selectedOrder.customer_phone}`} className="contact-action call">
                        📞 Call
                      </a>
                      <a 
                        href={`https://wa.me/91${selectedOrder.customer_phone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-action whatsapp"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                {/* Measurements */}
                {selectedOrder.chest && (
                  <div className="info-section measurements-section">
                    <h3>📏 Measurements</h3>
                    <div className="measurements-prominent">
                      <div className="measure-box">
                        <span className="measure-value">{selectedOrder.chest}"</span>
                        <span className="measure-label">Chest</span>
                      </div>
                      <div className="measure-box">
                        <span className="measure-value">{selectedOrder.waist}"</span>
                        <span className="measure-label">Waist</span>
                      </div>
                      <div className="measure-box">
                        <span className="measure-value">{selectedOrder.shoulders}"</span>
                        <span className="measure-label">Shoulders</span>
                      </div>
                      <div className="measure-box">
                        <span className="measure-value">{selectedOrder.arm_length}"</span>
                        <span className="measure-label">Arm</span>
                      </div>
                      <div className="measure-box">
                        <span className="measure-value">{selectedOrder.jacket_length}"</span>
                        <span className="measure-label">Length</span>
                      </div>
                      <div className="measure-box">
                        <span className="measure-value">{selectedOrder.neck}"</span>
                        <span className="measure-label">Neck</span>
                      </div>
                    </div>
                    {selectedOrder.measurement_notes && (
                      <div className="measurement-notes">
                        <strong>Note:</strong> {selectedOrder.measurement_notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline */}
                {orderHistory.length > 0 && (
                  <div className="info-section">
                    <h3>📅 Timeline</h3>
                    <div className="mini-timeline">
                      {orderHistory.slice(0, 5).map((item, i) => (
                        <div key={i} className="timeline-entry">
                          <span className="timeline-status">{formatStatus(item.status)}</span>
                          <span className="timeline-date">{formatDate(item.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TailorLayout>
  );
}

// Kanban Card Component with Drag Support
function KanbanCard({ order, urgency, onViewDetails, formatDate, onDragStart, onDragEnd, isDragging }) {
  return (
    <div 
      className={`kanban-card ${urgency} ${isDragging ? 'dragging' : ''}`} 
      onClick={onViewDetails}
      draggable="true"
      onDragStart={(e) => onDragStart(e, order)}
      onDragEnd={onDragEnd}
    >
      <div className="drag-handle">⋮⋮</div>
      <div className="kanban-card-header">
        <span className="kanban-order-id">{order.order_id}</span>
        {urgency !== 'normal' && (
          <span className={`urgency-dot ${urgency}`} title={urgency === 'overdue' ? 'Overdue!' : urgency === 'today' ? 'Due Today' : 'Due Soon'} />
        )}
      </div>
      
      <div className="kanban-card-body">
        <h4>{order.style}</h4>
        <p className="fabric">{order.fabric_name} - {order.fabric_color}</p>
        <div className="kanban-meta">
          <span className="customer">{order.customer_name}</span>
          <span className={`due ${urgency}`}>{formatDate(order.estimated_delivery)}</span>
        </div>
      </div>
    </div>
  );
}

export default TailorOrders;
