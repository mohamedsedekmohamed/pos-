import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900" dir="rtl">
      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
