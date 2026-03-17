import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { recordService } from '../../services/record.service.js';
import { appointmentService } from '../../services/appointment.service.js';
import { accessLinkService } from '../../services/accessLink.service.js';
import { notificationService } from '../../services/notification.service.js';
import './PatientDashboard.css';

const stMap = { normal: 'success', review: 'warning', critical: 'danger' };
const actColors = { upload_success: '#22C55E', access_granted: '#0A6EBD', appointment_booked: '#F5A623', link_revoked: '#E84545', record_shared: '#00C9A7' };

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [records,       setRecords]       = useState([]);
  const [appointments,  setAppointments]  = useState([]);
  const [links,         setLinks]         = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [recRes, apptRes, linkRes, notifRes] = await Promise.allSettled([
          recordService.getAll({ limit: 4 }),
          appointmentService.getAll({ status: 'upcoming' }),
          accessLinkService.getAll(),
          notificationService.getAll(),
        ]);

        if (recRes.status   === 'fulfilled') setRecords(recRes.value.data?.records || []);
        if (apptRes.status  === 'fulfilled') setAppointments(apptRes.value.data?.appointments || []);
        if (linkRes.status  === 'fulfilled') setLinks(linkRes.value.data?.links || []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data?.notifications || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeLinks   = links.filter(l => !l.isRevoked && new Date(l.expiresAt) > new Date());
  const nextAppt      = appointments[0];

  const stats = [
    { label: 'Total Records',  value: records.length || '0',       sub: 'Uploaded documents',         color: 'blue',   icon: '📋' },
    { label: 'Active Links',   value: activeLinks.length || '0',   sub: `${links.length} total links`, color: 'teal',   icon: '🔗' },
    { label: 'Appointments',   value: appointments.length || '0',  sub: nextAppt ? `Next: ${new Date(nextAppt.date).toLocaleDateString('en-IN')}` : 'No upcoming', color: 'green', icon: '📅' },
    { label: 'Doctors Shared', value: activeLinks.length || '0',   sub: 'Active access links',         color: 'purple', icon: '👨‍⚕️' },
  ];

  if (loading) return <div className="pt-dashboard"><div className="loading-state">Loading dashboard…</div></div>;

  return (
    <div className="pt-dashboard">
      <div className="pt-welcome">
        <div>
          <h2>Good morning, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's a summary of your health records today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patient/records')}>+ Upload Record</button>
      </div>

      <div className="pt-stats">
        {stats.map((s, i) => (
          <div className={`pt-stat card pt-stat-${s.color}`} key={i} style={{ animationDelay: `${i * .07}s` }}>
            <span className="stat-icon">{s.icon}</span>
            <div>
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
              <p className="stat-sub">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-row">
        <div className="card pt-records-card">
          <div className="card-header">
            <h2>Recent Records</h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/patient/records')}>View All</button>
          </div>
          {records.length === 0 ? (
            <div className="empty-table-state">
              <span>📋</span>
              <p>No records yet. <button className="btn-link" onClick={() => navigate('/patient/records')}>Upload your first record</button></p>
            </div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Document</th><th>Type</th><th>Date</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td><span style={{ marginRight: 8 }}>📄</span>{r.title}</td>
                    <td><span className="badge badge-muted">{r.type}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(r.recordDate).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge badge-${stMap[r.status] || 'muted'}`}>{r.status}</span></td>
                    <td><button className="btn btn-ghost btn-sm">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pt-side">
          <div className="card pt-activity">
            <div className="card-header"><h2>Activity</h2></div>
            <div className="activity-list">
              {notifications.length === 0
                ? <p style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-muted)' }}>No recent activity</p>
                : notifications.slice(0, 5).map((n, i) => (
                  <div className="activity-row" key={i}>
                    <span className="activity-dot" style={{ background: actColors[n.type] || '#888' }} />
                    <div>
                      <p>{n.message}</p>
                      <span>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="card pt-quick">
            <div className="card-header"><h2>Quick Actions</h2></div>
            <div className="quick-grid">
              {[
                { label: 'Upload Record',    path: '/patient/records',      icon: '📤' },
                { label: 'Share Access',     path: '/patient/share',        icon: '🔗' },
                { label: 'Book Appointment', path: '/patient/appointments', icon: '📅' },
                { label: 'View Timeline',    path: '/patient/timeline',     icon: '🕐' },
              ].map(q => (
                <button key={q.label} className="quick-btn" onClick={() => navigate(q.path)}>
                  <span>{q.icon}</span><span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card pt-banner">
        <div className="banner-left">
          <span>🏥</span>
          <div>
            <h3>Your Medical Timeline</h3>
            <p>View your complete health history in chronological order.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patient/timeline')}>Full Timeline →</button>
      </div>
    </div>
  );
}