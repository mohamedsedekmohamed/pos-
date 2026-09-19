import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

import { useLanguage } from '../context/LanguageContext';

const DashboardLayout: React.FC = () => {
  const { dir } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-black" dir={dir}>
      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
