import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar.jsx';
import AppTopBar from './AppTopBar.jsx';
import './AppLayout.css';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`app-layout ${collapsed ? 'collapsed' : ''}`}>
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      <div className="app-main">
        <AppTopBar onToggle={() => setCollapsed(p => !p)} />
        <main className="app-content" key={window.location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}