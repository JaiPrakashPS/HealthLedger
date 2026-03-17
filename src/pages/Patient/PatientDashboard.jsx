import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './PatientDashboard.css';

const stats = [
  { label: 'Total Records',   value: '24', sub: '+2 this month',        color: 'blue',   icon: '📋' },
  { label: 'Active Links',    value: '3',  sub: '1 expiring soon',      color: 'teal',   icon: '🔗' },
  { label: 'Appointments',    value: '5',  sub: 'Next: Tomorrow 10am',  color: 'green',  icon: '📅' },
  { label: 'Doctors Shared',  value: '7',  sub: 'Across 4 hospitals',   color: 'purple', icon: '👨‍⚕️' },
];

const recent = [
  { name: 'Blood Test Report',      type: 'Lab Report',   date: '12 Mar 2025', status: 'normal' },
  { name: 'Chest X-Ray',            type: 'Radiology',    date: '28 Feb 2025', status: 'review' },
  { name: 'Diabetes Prescription',  type: 'Prescription', date: '20 Feb 2025', status: 'normal' },
  { name: 'ECG Report',             type: 'Cardiology',   date: '10 Feb 2025', status: 'critical' },
];

const activity = [
  { msg: 'Dr. Priya Kumar accessed your records',   time: '2 min ago',  type: 'access' },
  { msg: 'Chest X-Ray uploaded successfully',        time: '1 hour ago', type: 'upload' },
  { msg: 'Appointment confirmed at Apollo Hospital', time: '3 hours ago',type: 'appt' },
  { msg: 'Access link shared with Dr. Mehta',        time: 'Yesterday',  type: 'share' },
];

const actColors = { access:'#0A6EBD', upload:'#22C55E', appt:'#F5A623', share:'#00C9A7' };
const stMap     = { normal:'success', review:'warning', critical:'danger' };

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          <div className={`pt-stat card pt-stat-${s.color}`} key={i} style={{ animationDelay:`${i*.07}s` }}>
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
          <table className="data-table">
            <thead><tr><th>Document</th><th>Type</th><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={i}>
                  <td><span style={{marginRight:8}}>📄</span>{r.name}</td>
                  <td><span className="badge badge-muted">{r.type}</span></td>
                  <td style={{color:'var(--text-secondary)',fontSize:13}}>{r.date}</td>
                  <td><span className={`badge badge-${stMap[r.status]}`}>{r.status}</span></td>
                  <td><button className="btn btn-ghost btn-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-side">
          <div className="card pt-activity">
            <div className="card-header"><h2>Activity</h2></div>
            <div className="activity-list">
              {activity.map((a, i) => (
                <div className="activity-row" key={i}>
                  <span className="activity-dot" style={{ background: actColors[a.type] }} />
                  <div>
                    <p>{a.msg}</p>
                    <span>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card pt-quick">
            <div className="card-header"><h2>Quick Actions</h2></div>
            <div className="quick-grid">
              {[
                { label:'Upload Record',    path:'/patient/records',      icon:'📤' },
                { label:'Share Access',     path:'/patient/share',        icon:'🔗' },
                { label:'Book Appointment', path:'/patient/appointments', icon:'📅' },
                { label:'View Timeline',    path:'/patient/timeline',     icon:'🕐' },
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
            <h3>Your Health Summary</h3>
            <p>Last check-up: 15 Mar 2025 · Blood pressure: Normal · Blood sugar: Borderline</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patient/timeline')}>Full Timeline →</button>
      </div>
    </div>
  );
}