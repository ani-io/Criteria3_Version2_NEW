// index.js (or index.jsx)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import UserData from './UserData.jsx';
import FrontPage from './FrontPage.jsx';
import Tree from './Tree.jsx';
import Course from './Course.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import router components


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        {/* <Route path="/user-data" element={<UserData />} /> */}
        <Route path="/app" element={<App />} />
        <Route path="/tree" element={<Tree />} />
        <Route path="/course" element={<Course />} />
        
        
      
      </Routes>
    </BrowserRouter>
  </StrictMode>
);