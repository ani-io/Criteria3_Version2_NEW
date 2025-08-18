import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Instagram,
  Twitter,
  Linkedin,
  Lightbulb,
  Home,
  GraduationCap,
  Building2,
  Puzzle,
  Rocket,
} from "lucide-react";
import "./FrontPage.css";
import logo from "./assets/logo.png";

export default function FrontPage() {
  return (
    <div className="front-page-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
              <img src={logo} alt="logo" className="logo-img" />
            </Link>
          </div>
          <div className="navbar-menu">
            {["Home", "Upload", "Blog", "Contact Us"].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase().replace(" ", "-")}`}
                className="menu-link"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">
            D.Y. Patil College of Engineering, Akurdi
          </h1>
          <p className="hero-subtitle">Department of Computer Engineering</p>
          <Link to="/tree" className="hero-button">
            Automated Attainment Calculator
          </Link>
        </div>

        <div className="features-section">
          <div className="feature-card small-card">
            <Lightbulb className="feature-icon" />
            <h2 className="feature-title">Vision of Institute </h2>
            <p className="feature-description">
              Empowerment through Knowledge.
            </p>
          </div>
          <div className="feature-card small-card">
            <GraduationCap className="feature-icon" />
            <h2 className="feature-title">Mission of Institute</h2>
            <p className="feature-description">
              M1 - To educate the students to transform them as professionally
              competent and quality conscious engineers.<br></br> M2 - To Provide
              Conducive Environment for Teaching Learning and overall
              personality development. M3 - To culminate the Institute into an
              International seat of excellence.
            </p>
          </div>
          <div className="feature-card">
            <Building2 className="feature-icon" />
            <h2 className="feature-title">Vision of Department</h2>
            <p className="feature-description">
              Garnering Academic Excellence through Competency Building.
            </p>
          </div>
          <div className="feature-card">
            <Puzzle className="feature-icon" />
            <h2 className="feature-title">Mission of Department</h2>
            <p className="feature-description">
              M1- To inculcate academic excellence in the students by providing
              conducive and sustainable environment for lifelong learning.<br></br> M2-
              To transform the students into quality conscious computing
              professionals capable to build state of the art software and
              systems in various domains.<br></br> M3- To implant resilience of knowledge
              enhancement, proficiency and teamwork in the students to make them
              globally competent. M4- To empower and up skill the students
              preserving Indianness for betterment of humanity.
            </p>
          </div>
          <div className="feature-card">
            <Rocket className="feature-icon" />
            <h2 className="feature-title">
              Program Educational Objectives (PEOs)
            </h2>
            <p className="feature-description">
              PEO1- To ensure development of graduates possessing strong
              foundations of computer programming knowledge.<br></br> PEO2-To encourage
              students to establish themselves as successful professionals by
              solving complex problems with computing skills in teams as well as
              individually.<br></br> PEO3-To prepare students to excel in higher
              education to meet challenges of changing scenarios of computing
              expertise at global level.<br></br> PEO4-To strengthen lifelong learning
              abilities of students in latest computing areas in variety of
              domains.<br></br> PEO5- To inculcate an understanding of social
              responsibility and Indian ethos among the students.
            </p>
          </div>
          <div className="feature-card">
            <Rocket className="feature-icon" />
            <h2 className="feature-title">Program Specific Outcomes (PSO)</h2>
            <p className="feature-description">
              PSO1: Professional Skills-The ability to understand, analyze and
              develop computer programs in the areas related to algorithms,
              system software, multimedia, web design, big data analytics, and
              networking for efficient design of computer-based systems of
              varying complexities.<br></br> PSO2: Problem-Solving Skills- The ability to
              apply standard practices and strategies in software project
              development using open-ended programming environments to deliver a
              quality product for business success.<br></br> PSO3: Successful Career and
              Entrepreneurship- The ability to employ modern computer languages,
              environments and platforms in creating innovative career paths to
              be an entrepreneur and to have a zest for higher studies.
            </p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-contact">
            <h3 className="footer-heading">Contact Us</h3>
            <p className="footer-text">
              Sector 29, Nigdi Pradhikaran, Pimpri-Chinchwad, near Akurdi
              Railway Station, Shivala Colony, Gurudwara Colony, Nigdi, Pune,
              Pimpri-Chinchwad, Maharashtra 411044, India
            </p>
            <p className="footer-text">Phone: +91 1234567890</p>
            <p className="footer-text">Email: info@dyp.edu</p>
          </div>
          <div className="footer-links">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-list">
              <li>
                <Link to="/admissions" className="footer-link">
                  Admissions
                </Link>
              </li>
              <li>
                <Link to="/departments" className="footer-link">
                  Departments
                </Link>
              </li>
              <li>
                <Link to="/research" className="footer-link">
                  Research
                </Link>
              </li>
              <li>
                <Link to="/careers" className="footer-link">
                  Careers
                </Link>
              </li>
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
            © 2022 D. Y. Patil College of Engineering, Akurdi. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
