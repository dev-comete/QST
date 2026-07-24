import React from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {/* Outlet représente la page actuelle (Dashboard, Banque, etc.) */}
      <main style={{ flex: 1, padding: '20px', backgroundColor: '#f4f7f6' }}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;