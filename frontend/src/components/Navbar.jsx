/* ============================================
   Navbar Component
   ============================================ */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // 🔥 Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`navbar 
        ${isScrolled ? "transparent" : ""} 
        ${isMenuOpen ? "menu-open" : ""}
      `}
    >
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="FabNStitch" />
        </Link>

        {/* Navigation Menu */}
        <ul className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <li>
            <a href="/#home" onClick={closeMenu}>Home</a>
          </li>

          <li>
            <Link to="/fabrics" onClick={closeMenu}>Fabrics</Link>
          </li>

          <li>
            <a href="/#how-it-works" onClick={closeMenu}>How It Works</a>
          </li>

          <li>
            <a href="/#reviews" onClick={closeMenu}>Reviews</a>
          </li>

          <li>
            <a href="/#contact" onClick={closeMenu}>Contact</a>
          </li>

          {/* Mobile-only buttons */}
          <li className="mobile-actions">
            <Link to="/track" className="btn btn-outline" onClick={closeMenu}>
              Track Order
            </Link>

            <Link to="/login" className="btn btn-primary" onClick={closeMenu}>
              Login
            </Link>
          </li>
        </ul>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          <Link to="/track" className="btn btn-outline">
            Track Order
          </Link>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className={`navbar-toggle ${isMenuOpen ? "active" : ""}`}
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
