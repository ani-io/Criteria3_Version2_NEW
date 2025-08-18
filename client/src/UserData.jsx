import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Linkedin } from "lucide-react";
import "./UserData.css";
import logo from "./assets/logo.png"

function UserData() {
  const [teacherName, setTeacherName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      teacherName,
      selectedClass,
      selectedDivision,
      selectedSemester,
      subject,
      academicYear,
    });
  };

  return (
    <div className="user-data-page-container">
      {/* Navbar (Header) */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
             <img src={logo} alt="logo" className='logo-img' />
            </Link>
          </div>

          <div className="Navbar-title">
            Department of Computer Engineering
          </div>
          
        </div>
      </nav>

      <div className="container">
        <form className="form-card" onSubmit={handleSubmit}>
          <h1>Attainment Calculator</h1>
          <div className="form-group">
            <label htmlFor="teacherName">Teacher Name:</label>
            <input
              type="text"
              id="teacherName"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="classSelect">Select Class:</label>
            <select
              id="classSelect"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              <option value="">Select Class</option>
              <option value="SE">SE</option>
              <option value="TE">TE</option>
              <option value="BE">BE</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="divisionSelect">Select Division:</label>
            <select
              id="divisionSelect"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              required
            >
              <option value="">Select Division</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="semesterSelect">Select Semester:</label>
            <select
              id="semesterSelect"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              required
            >
              <option value="">Select Semester</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject:</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="academicYear">Academic Year:</label>
            <input
              type="text"
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            />
          </div>

          {/* <button type="submit" className="submit-button">
            Submit
          </button> */}
        </form>
      </div>
    </div>
  );
}

export default UserData;