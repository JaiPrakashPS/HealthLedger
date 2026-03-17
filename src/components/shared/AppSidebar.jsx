import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './AppSidebar.css';

const navConfig = {
  patient: [
    { to: 'dashboard',    icon: '⬡', label: 'Dashboard' },
    { to: 'records',      icon: '📋', label: 'My Records' },
    { to: 'timeline',     icon: '🕐', label: 'Timeline' },
    { to: 'share',        icon: '🔗', label: 'Share Access' },
    { to: 'appointments', icon: '📅', label: 'Appointments' },
    { to: 'profile',      icon: '👤', label: 'My Profile' },
  ],
  doctor: [
    { to: 'dashboard',    icon: '⬡', label: 'Dashboard' },
    { to: 'patients',     icon: '👥', label: 'My Patients' },
    { to: 'records',      icon: '📋', label: 'Shared Records' },
    { to: 'appointments', icon: '📅', label: 'Appointments' },
    { to: 'profile',      icon: '👤', label: 'My Profile' },
  ],
  admin: [
    { to: 'dashboard', icon: '⬡', label: 'Dashboard' },
    { to: 'users',     icon: '👥', label: 'Users' },
    { to: 'audit',     icon: '📋', label: 'Audit Log' },
    { to: 'system',    icon: '⚙️', label: 'System' },
  ],
};

const roleLabels = { patient: 'Patient Portal', doctor: 'Doctor Portal', admin: 'Admin Panel' };
const roleColors = { patient: '#0A6EBD', doctor: '#00C9A7', admin: '#7C3AED' };

export default function AppSidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = navConfig[user?.role] || [];
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-head">
        <div className="sidebar-logo">
          <div className="logo-mark">H</div>
          {!collapsed && (
            <div>
              <span className="logo-name">HealthLedger</span>
              <span className="logo-sub">{roleLabels[user?.role]}</span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>{collapsed ? '›' : '‹'}</button>
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="sidebar-user-card">
          <div className="avatar sidebar-avatar" style={{ background: `linear-gradient(135deg,${roleColors[user?.role]},#0D1B2A)`, color: '#fff', fontSize: 14, width: 36, height: 36 }}>
            {initials}
          </div>
          <div>
            <p className="sidebar-user-name">{user?.name}</p>
            <p className="sidebar-user-role">{user?.role === 'doctor' ? user?.spec || 'Doctor' : user?.role}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {!collapsed && <p className="sidebar-section-label">MENU</p>}
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        <button className="sidebar-nav-item logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && <p className="sidebar-version">v1.0 · HIPAA Compliant</p>}
      </div>
    </aside>
  );
}