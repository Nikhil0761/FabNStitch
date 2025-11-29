/* ============================================
   Navbar Component
   ============================================
   
   📚 LEARNING: React Component Structure
   
   A React component is a JavaScript function that returns JSX (HTML-like syntax).
   
   Key concepts:
   - Components start with CAPITAL letter (Navbar, not navbar)
   - They return JSX wrapped in parentheses
   - Use className instead of class (class is reserved in JS)
   - Export the component to use it elsewhere
   
   ============================================ */

import { useState } from 'react';  // Hook for managing state
import logo from '../assets/logo.png';
import './Navbar.css';

function Navbar() {
  // useState hook - manages whether mobile menu is open
  // isMenuOpen = current value, setIsMenuOpen = function to update it
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Logo */}
        <a href="/" className="navbar-logo">
          <img src={logo} alt="FabNStitch" />
        </a>

        {/* Navigation Links */}
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><a href="#home">Home</a></li>
          <li><a href="#fabrics">Fabrics</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#reviews">Reviews</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <a href="/track" className="btn btn-outline">Track Order</a>
          <a href="/login" className="btn btn-primary">Login</a>
        </div>

        {/* Mobile Menu Toggle (hamburger icon) */}
        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

// Export the component so other files can import it
export default Navbar;

