import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { doctorService } from '../../services/doctor.service.js';
import { appointmentService } from '../../services/appointment.service.js';
import { notificationService } from '../../services/notification.service.js';
import './DoctorDashboard.css';

const stMap = { active:'success', reviewed:'primary', pending:'warning' };

export default function DoctorDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [patients,      setPatients]      = useState([]);
  const [appointments,  setAppointments]  = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [patRes, apptRes, notifRes] = await Promise.allSettled([
          doctorService.getPatients(),
          appointmentService.getDoctorAppointments({ status: 'upcoming' }),
          notificationService.getAll(),
        ]);
        if (patRes.status   === 'fulfilled') setPatients(patRes.value.data?.patients || []);
        if (apptRes.status  === 'fulfilled') setAppointments(apptRes.value.data?.appointments || []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data?.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalRecords  = patients.reduce((sum, p) => sum + (p.records?.length || 0), 0);
  const nextAppt      = appointments[0];

  const stats = [
    { label:'Patients Today',  value: patients.length,      sub: `${totalRecords} records shared`, color:'blue',   icon:'👥' },
    { label:'Shared Records',  value: totalRecords,         sub: `From ${patients.length} patients`, color:'teal', icon:'📋' },
    { label:'Appointments',    value: appointments.length,  sub: nextAppt ? `Next: ${nextAppt.time}` : 'No upcoming', color:'green', icon:'📅' },
    { label:'Notifications',   value: notifications.filter(n => !n.isRead).length, sub: 'Unread', color:'orange', icon:'🔔' },
  ];

  if (loading) return <div className="dd-page"><div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading dashboard…</div></div>;

  return (
    <div className="dd-page">
      <div className="dd-welcome">
        <div>
          <h2>Good morning, {user?.name} 👋</h2>
          <p>
            {patients.length > 0
              ? `You have ${patients.length} patient${patients.length > 1 ? 's' : ''} with shared records.`
              : 'No patients have shared records with you yet.'
            }
          </p>
        </div>
      </div>

      <div className="dd-stats">
        {stats.map((s, i) => (
          <div key={i} className={`dd-stat card dd-stat-${s.color}`} style={{ animationDelay: `${i * .07}s` }}>
            <span className="stat-icon">{s.icon}</span>
            <div>
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
              <p className="stat-sub">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Recent Patient Records</h2>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/doctor/patients')}>All Patients</button>
        </div>
        {patients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 28, marginBottom: 12 }}>📋</p>
            <p>No patients have shared records yet.</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>Patients can share records by generating a link with your email address.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Patient</th><th>Records Shared</th><th>Shared On</th><th>Expires</th><th></th></tr>
            </thead>
            <tbody>
              {patients.slice(0, 5).map((p, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 32, height: 32, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 11 }}>
                        {p.patient?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13.5 }}>{p.patient?.name}</p>
                        {p.patient?.phone && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.patient.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.records?.slice(0, 2).map(r => <span key={r._id} className="badge badge-muted">{r.title}</span>)}
                      {p.records?.length > 2 && <span className="badge badge-muted">+{p.records.length - 2} more</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(p.sharedAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(p.expiresAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/doctor/records')}>View Records</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {patients.length > 0 && (
        <div className="card dd-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>📋</span>
            <div>
              <h3>Review Shared Records</h3>
              <p>{totalRecords} record{totalRecords !== 1 ? 's' : ''} shared by {patients.length} patient{patients.length !== 1 ? 's' : ''}.</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/doctor/records')}>Review Now →</button>
        </div>
      )}
    </div>
  );
}