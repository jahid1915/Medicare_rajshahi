import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NiramoyNavbar from './PublicHeader';
import NiramoyFooter from './NiramoyFooter';
import MobileBottomNav from './MobileBottomNav';

export default function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="public-layout">
      <NiramoyNavbar />
      <main className={`public-main ${isHome ? 'public-main--home' : 'public-main--padded'}`}>
        <div key={location.pathname} className="niramoy-page-transition">
          <Outlet />
        </div>
      </main>
      <NiramoyFooter />
      <MobileBottomNav />
    </div>
  );
}
