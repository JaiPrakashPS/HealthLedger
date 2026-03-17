import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './AppTopBar.css';

const pageTitles = {
  dashboard:    { title: 'Dashboard',        sub: 'Overview at a glance' },
  records:      { title: 'My Records',       sub: 'All your medical documents' },
  timeline:     { title: 'Medical Timeline', sub: 'Your health history' },
  share:        { title: 'Share Access',     sub: 'Manage doctor access links' },
  appointments: { title: 'Appointments',     sub: 'Upcoming & past visits' },
  profile:      { title: 'My Profile',       sub: 'Personal & medical details' },
  patients:     { title: 'My Patients',      sub: 'Patients who shared records' },
  users:        { title: 'Users',            sub: 'Manage all accounts' },
  audit:        { title: 'Audit Log',        sub: 'All system activity' },
  system:       { title: 'System',           sub: 'Infrastructure & health' },
};

const notifs = [
  { id: 1, type: 'access', msg: 'Dr. Priya Kumar viewed your records', time: '2m ago',  unread: true },
  { id: 2, type: 'upload', msg: 'Blood test report uploaded',           time: '1h ago', unread: true },
  { id: 3, type: 'appt',   msg: 'Appointment tomorrow at 10:00 AM',     time: '3h ago', unread: false },
];
const dotColors = { access: '#0A6EBD', upload: '#22C55E', appt: '#F5A623' };

export default function AppTopBar({ onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState('');

  const segment = window.location.pathname.split('/').at(-1);
  const page = pageTitles[segment] || { title: 'HealthLedger', sub: '' };
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const unread = notifs.filter(n => n.unread).length;

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button className="btn btn-icon topbar-menu" onClick={onToggle}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <rect width="18" height="2" rx="1" fill="currentColor"/>
            <rect y="6" width="12" height="2" rx="1" fill="currentColor"/>
            <rect y="12" width="18" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>
        <div className="topbar-title">
          <h1>{page.title}</h1>
          <p>{page.sub}</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="notif-wrap">
          <button className="btn btn-icon notif-btn" onClick={() => setNotifOpen(p => !p)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
            {unread > 0 && <span className="notif-dot-badge">{unread}</span>}
          </button>

          {notifOpen && (
            <div className="notif-panel">
              <div className="notif-panel-head">
                <span>Notifications</span>
                <span className="badge badge-primary">{unread} new</span>
              </div>
              {notifs.map(n => (
                <div key={n.id} className={`notif-row ${n.unread ? 'unread' : ''}`}>
                  <span className="notif-type-dot" style={{ background: dotColors[n.type] }} />
                  <div className="notif-row-body">
                    <p>{n.msg}</p>
                    <span>{n.time}</span>
                  </div>
                </div>
              ))}
              <div className="notif-panel-foot">View all</div>
            </div>
          )}
        </div>

        <div className="topbar-user" onClick={() => navigate(`/${user?.role}/profile`)}>
          <div className="avatar topbar-avatar"
            style={{ width: 34, height: 34, fontSize: 12, background: 'linear-gradient(135deg,#0A6EBD,#00C9A7)', color: '#fff' }}>
            {initials}
          </div>
          <div className="topbar-user-info">
            <p>{user?.name}</p>
            <span className={`role-tag role-${user?.role}`}>{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}