/* ============================================
   Get Started Component - Contact Form Section
   ============================================ */

import { useState } from 'react';
import './GetStarted.css';
import { API_URL } from '../config';

function GetStarted() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    need: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user types
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setMessage({ 
        type: 'success', 
        text: 'Thank you! We will contact you soon.' 
      });
      setFormData({ name: '', email: '', phone: '', company: '', need: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Something went wrong. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    '30+ custom measurements',
    'Premium fabrics',
    'Free 7-day alterations',
    '100% satisfaction guaranteed'
  ];

  return (
    <section className="get-started section" id="get-started">
      <div className="container">
        <div className="get-started-grid">
          {/* Left Side - Content */}
          <div className="get-started-content">
            <h2>Join 5000+ Happy Customers</h2>
            <p className="get-started-description">
              Experience uniforms that actually fit your body—not the other way around.
            </p>
            
            <ul className="benefits-list">
              {benefits.map((benefit, index) => (
                <li key={index}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side - Form */}
          <div className="get-started-form-card">
            <h3>Get Started</h3>
            
            {message.text && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="company"
                  placeholder="College / Company (optional)"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <select
                  name="need"
                  value={formData.need}
                  onChange={handleChange}
                  required
                >
                  <option value="">What's your need?</option>
                  <option value="blazer">Custom Blazer</option>
                  <option value="uniform">Uniform Order</option>
                  <option value="corporate">Corporate Order</option>
                  <option value="alteration">Alteration Service</option>
                  <option value="consultation">Fabric Consultation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Book Your Measurement Now'}
              </button>

              <p className="form-note">
                No commitment. No pressure. Just great uniforms.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GetStarted;
