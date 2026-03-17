import { useState, useEffect } from 'react';
import { recordService } from '../../services/record.service.js';
import './PatientTimeline.css';

const typeColors = {
  'Lab Report':'#0A6EBD','Radiology':'#7C3AED','Consultation':'#00C9A7',
  'Cardiology':'#E84545','Vaccination':'#22C55E','General':'#F5A623',
  'Prescription':'#F5A623','Certificate':'#888','default':'#888'
};
const stMap = { normal:'success', review:'warning', critical:'danger' };

export default function PatientTimeline() {
  const [records,     setRecords]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [expanded,    setExpanded]    = useState(null);
  const [yearFilter,  setYearFilter]  = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await recordService.getTimeline();
        setRecords(res.data?.records || []);
      } catch (err) {
        console.error('Timeline load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const years = ['All', ...new Set(records.map(r => new Date(r.recordDate).getFullYear().toString()))];
  const list  = yearFilter === 'All' ? records : records.filter(r => new Date(r.recordDate).getFullYear().toString() === yearFilter);

  if (loading) return (
    <div className="ptl-page">
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading timeline…</div>
    </div>
  );

  return (
    <div className="ptl-page">
      <div className="ptl-header card">
        <div>
          <h2>Medical Timeline</h2>
          <p>{records.length} health events recorded</p>
        </div>
        <div className="ptl-year-filters">
          {years.map(y => (
            <button key={y} className={`filter-pill ${yearFilter === y ? 'active' : ''}`} onClick={() => setYearFilter(y)}>{y}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🕐</p>
          <p>No records found. Upload medical records to build your timeline.</p>
        </div>
      ) : (
        <div className="ptl-body">
          <div className="ptl-line" />
          {list.map((ev, i) => {
            const color = typeColors[ev.type] || typeColors.default;
            return (
              <div key={ev._id} className={`ptl-item ${i % 2 === 0 ? 'left' : 'right'}`} style={{ animationDelay: `${i * .07}s` }}>
                <div className="ptl-dot" style={{ background: color }}>
                  <div className="ptl-dot-inner" />
                </div>
                <div className="ptl-card card" onClick={() => setExpanded(expanded === ev._id ? null : ev._id)}>
                  <div className="ptlc-head">
                    <span className="ptlc-type" style={{ background: color + '18', color }}>{ev.type}</span>
                    <span className={`badge badge-${stMap[ev.status] || 'muted'}`}>{ev.status}</span>
                  </div>
                  <h3>{ev.title}</h3>
                  <p className="ptlc-date">📅 {new Date(ev.recordDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <div className="ptlc-meta">
                    {ev.doctor   && <span>👨‍⚕️ {ev.doctor}</span>}
                    {ev.hospital && <span>🏥 {ev.hospital}</span>}
                  </div>

                  {expanded === ev._id && (
                    <div className="ptlc-note anim-fade">
                      {ev.notes && <p>{ev.notes}</p>}
                      {ev.tags?.length > 0 && (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                          {ev.tags.map(t => <span key={t} className="badge badge-muted">#{t}</span>)}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <a href={ev.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">📄 View File</a>
                      </div>
                    </div>
                  )}
                  <button className="ptlc-toggle">{expanded === ev._id ? '▲ Less' : '▼ Details'}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}