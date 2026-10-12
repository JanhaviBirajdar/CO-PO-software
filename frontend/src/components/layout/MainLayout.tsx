import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useTheme } from '../../context/ThemeContext';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className={`flex min-h-screen font-sans relative overflow-x-hidden transition-colors duration-300 ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main
          className={`flex-1 p-3 xs:p-4 sm:p-6 overflow-y-auto w-full max-w-full transition-colors duration-300 ${
            isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
