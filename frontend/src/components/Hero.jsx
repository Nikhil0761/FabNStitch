/* ============================================
   Hero Component
   ============================================
   
   📚 LEARNING: JSX Syntax
   
   JSX lets you write HTML-like code in JavaScript.
   Key differences from HTML:
   - className instead of class
   - style={{ }} for inline styles (object syntax)
   - {expression} to embed JavaScript
   - Self-closing tags need /  like <img />
   
   ============================================ */

import './Hero.css';
import blazerImage from '../assets/Blazer_collection.png';

function Hero() {
  return (
    <section className="hero" id="home">
      {/* Background decorative elements */}
      <div className="hero-bg">
        <div className="hero-pattern"></div>
      </div>
      
      <div className="container hero-container">
        {/* Left side - Text content */}
        <div className="hero-content">
          <h1>
            Redefining  <span className="text-accent">Organization </span>identity,
            {/* <br /> */}
            with Premium Custom Tailored Uniforms
          </h1>
          <p className="hero-description">
            Experience the art of custom tailoring with FabNStitch. 
            From premium fabrics to precise measurements, we create 
            blazers that fit your unique style and personality.
          </p>
          
          {/* Call to action buttons */}
          <div className="hero-buttons">
            <a href="#fabrics" className="btn btn-primary">
              Explore Fabrics
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#how-it-works" className="btn btn-outline">
              How It Works
            </a>
          </div>

          {/* Trust indicators */}
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat">
              <span className="stat-number">15+</span>
              <span className="stat-label">Premium Fabrics</span>
            </div>
            <div className="stat">
              <span className="stat-number">4.7/5</span>
              <span className="stat-label">Customer Rating</span>
            </div>
          </div>
        </div>

        {/* Right side - Visual */}
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <img 
              src={blazerImage} 
              alt="Premium Blazer Collection" 
              className="hero-image"
            />
          </div>
          
          {/* Floating cards for visual interest */}
          <div className="floating-card card-1">
            <span className="card-icon">📏</span>
            <span>Perfect Fit</span>
          </div>
          <div className="floating-card card-2">
            <span className="card-icon">🧵</span>
            <span>Hand Stitched</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

