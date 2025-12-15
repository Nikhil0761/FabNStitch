/* ============================================
   Navbar Component
   ============================================
   
   📚 LEARNING: React Router Navigation
   
   Use <Link> instead of <a> for internal navigation:
   - <a href="/login"> causes full page reload
   - <Link to="/login"> navigates without reload (faster!)
   
   Use <a> for:
   - External links
   - Anchor links (like #home, #about)
   
   ============================================ */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when a link is clicked
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Logo - Use Link for internal navigation */}
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="FabNStitch" />
        </Link>

        {/* Navigation Links - Use <a> for anchor links within page */}
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><a href="#home" onClick={closeMenu}>Home</a></li>
          <li><a href="#fabrics" onClick={closeMenu}>Fabrics</a></li>
          <li><a href="#how-it-works" onClick={closeMenu}>How It Works</a></li>
          <li><a href="#reviews" onClick={closeMenu}>Reviews</a></li>
          <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
          
          {/* Mobile-only action buttons inside menu */}
          <li className="mobile-actions">
            <Link to="/track" className="btn btn-outline" onClick={closeMenu}>Track Order</Link>
            <Link to="/login" className="btn btn-primary" onClick={closeMenu}>Login</Link>
          </li>
        </ul>

        {/* Action Buttons (Desktop only) */}
        <div className="navbar-actions">
          <Link to="/track" className="btn btn-outline">Track Order</Link>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>

        {/* Mobile Menu Toggle */}
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

export default Navbar;
