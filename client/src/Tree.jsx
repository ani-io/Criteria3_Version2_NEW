import React from 'react';
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { Instagram, Twitter, Linkedin } from "lucide-react";
import tree1 from './assets/tree1.jpeg';
import tree2 from './assets/tree2.jpeg';
import logo from "./assets/logo.png"
import './Tree.css';

function Tree() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleNextClick = () => {
    navigate('/app'); // Navigate to the /app route
  };

  return (
    <div className="tree-page-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
                <img src={logo} alt="logo" className='logo-img' />
            </Link>
          </div>
          
        </div>
      </nav>

      <main className="tree-main-content">
        <div className="image-container">
          <img src={tree1} alt="Tree 1" className="tree-image" />
          <img src={tree2} alt="Tree 2" className="tree-image" />
        </div>
        <div className="next-button-container">
          <button className="next-button" onClick={handleNextClick}>
            Next
          </button>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-contact">
            <h3 className="footer-heading">Contact Us</h3>
            <p className="footer-text">Sector 29, Nigdi Pradhikaran, Pimpri-Chinchwad, near Akurdi Railway Station, Shivala Colony, Gurudwara Colony, Nigdi, Pune, Pimpri-Chinchwad, Maharashtra 411044, India</p>
            <p className="footer-text">Phone: +91 1234567890</p>
            <p className="footer-text">Email: info@dyp.edu</p>
          </div>
          <div className="footer-links">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-list">
              <li><Link to="/admissions" className="footer-link">Admissions</Link></li>
              <li><Link to="/departments" className="footer-link">Departments</Link></li>
              <li><Link to="/research" className="footer-link">Research</Link></li>
              <li><Link to="/careers" className="footer-link">Careers</Link></li>
            </ul>
          </div>
          <div className="footer-social">
            <h3 className="footer-heading">Follow Us</h3>
            <div className="social-icons">
              <Link to="/instagram" className="social-icon">
                <span className="sr-only"></span>
                <Instagram className="icon" />
              </Link>
              <Link to="/twitter" className="social-icon">
                <span className="sr-only"></span>
                <Twitter className="icon" />
              </Link>
              <Link to="/linkedin" className="social-icon">
                <span className="sr-only"></span>
                <Linkedin className="icon" />
              </Link>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <p className="copyright-text">
            © 2022 D. Y. Patil College of Engineering, Akurdi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Tree;