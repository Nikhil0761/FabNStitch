/* ============================================
   Track Order Page Component
   ============================================
   
   📚 LEARNING: Conditional Rendering
   
   We show different content based on state:
   - No search yet: Show search form only
   - Loading: Show spinner
   - Order found: Show order details
   - Order not found: Show error message
   
   ============================================ */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import './TrackOrder.css';

function TrackOrder() {
  // State management
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  // Order status steps for progress tracker
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📋' },
    { key: 'confirmed', label: 'Confirmed', icon: '✓' },
    { key: 'stitching', label: 'Stitching', icon: '🧵' },
    { key: 'finishing', label: 'Finishing', icon: '✨' },
    { key: 'quality_check', label: 'Quality Check', icon: '🔍' },
    { key: 'ready', label: 'Ready', icon: '📦' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' }
  ];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      setError('Please enter an Order ID');
      return;
    }

    setIsLoading(true);
    setError('');
    setOrder(null);

    // TODO: Replace with actual API call to Spring Boot backend
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock data for demonstration
      if (orderId.toUpperCase() === 'ORD123' || orderId.toUpperCase() === 'DEMO') {
        setOrder({
          id: orderId.toUpperCase(),
          status: 'stitching',
          customerName: 'Rahul Kumar',
          fabric: 'Premium Italian Wool',
          style: 'Double-Breasted Blazer',
          color: 'Navy Blue',
          placedDate: '2024-11-25',
          estimatedDelivery: '2024-12-10',
          timeline: [
            { status: 'pending', date: '2024-11-25', time: '10:30 AM', note: 'Order placed successfully' },
            { status: 'confirmed', date: '2024-11-25', time: '02:15 PM', note: 'Order confirmed by tailor' },
            { status: 'stitching', date: '2024-11-26', time: '10:00 AM', note: 'Stitching in progress' }
          ]
        });
      } else {
        setError('Order not found. Please check your Order ID and try again.');
      }
    }, 1500);
  };

  // Get current step index for progress bar
  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  return (
    <div className="track-page">
      {/* Hero Section */}
      <section className="track-hero">
        <div className="container">
          <h1>Track Your Order</h1>
          <p>Enter your Order ID to check the current status of your bespoke blazer</p>
          
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="track-form">
            <div className="search-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Enter Order ID (e.g., ORD123)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Track'}
              </button>
            </div>
            <p className="search-hint">
              💡 Try "ORD123" or "DEMO" to see a sample order
            </p>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="track-results">
        <div className="container">
          {/* Loading State */}
          {isLoading && (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Searching for your order...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="error-state">
              <div className="error-icon">❌</div>
              <h3>Order Not Found</h3>
              <p>{error}</p>
              <Link to="/login" className="btn btn-outline">
                Login for More Details
              </Link>
            </div>
          )}

          {/* Order Found */}
          {order && !isLoading && (
            <div className="order-result">
              {/* Order Summary Card */}
              <div className="order-summary">
                <div className="summary-header">
                  <div>
                    <span className="order-label">Order ID</span>
                    <h2 className="order-id">{order.id}</h2>
                  </div>
                  <div className={`status-badge status-${order.status}`}>
                    {statusSteps.find(s => s.key === order.status)?.label || order.status}
                  </div>
                </div>
                
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="item-label">Fabric</span>
                    <span className="item-value">{order.fabric}</span>
                  </div>
                  <div className="summary-item">
                    <span className="item-label">Style</span>
                    <span className="item-value">{order.style}</span>
                  </div>
                  <div className="summary-item">
                    <span className="item-label">Color</span>
                    <span className="item-value">{order.color}</span>
                  </div>
                  <div className="summary-item">
                    <span className="item-label">Est. Delivery</span>
                    <span className="item-value highlight">{order.estimatedDelivery}</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="progress-tracker">
                <h3>Order Progress</h3>
                <div className="progress-steps">
                  {statusSteps.map((step, index) => {
                    const currentIndex = getCurrentStepIndex();
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    
                    return (
                      <div 
                        key={step.key} 
                        className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                      >
                        <div className="step-marker">
                          {isCompleted ? '✓' : step.icon}
                        </div>
                        <span className="step-label">{step.label}</span>
                        {index < statusSteps.length - 1 && (
                          <div className={`step-line ${isCompleted ? 'completed' : ''}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div className="order-timeline">
                <h3>Status History</h3>
                <div className="timeline">
                  {order.timeline.slice().reverse().map((item, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-status">
                            {statusSteps.find(s => s.key === item.status)?.label}
                          </span>
                          <span className="timeline-date">
                            {item.date} at {item.time}
                          </span>
                        </div>
                        <p className="timeline-note">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help Section */}
              <div className="help-section">
                <h4>Need Help?</h4>
                <p>If you have questions about your order, please contact us:</p>
                <div className="help-contacts">
                  <a href="tel:+919920077539" className="help-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    +91-9920077539
                  </a>
                  <a href="mailto:admin@fabnstitch.com" className="help-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    admin@fabnstitch.com
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default TrackOrder;
