import { useState, useEffect, useRef } from 'react';
import { recordService } from '../../services/record.service.js';
import './PatientRecords.css';

const TYPES = ['All', 'Lab Report', 'Radiology', 'Prescription', 'Cardiology', 'Vaccination', 'Certificate', 'Consultation', 'General'];
const stMap  = { normal: 'success', review: 'warning', critical: 'danger' };
const typeIcon = { 'Lab Report': '🧪', 'Radiology': '🩻', 'Prescription': '💊', 'Cardiology': '❤️', 'Certificate': '📜', 'Vaccination': '💉', 'Consultation': '🩺', 'General': '📄' };

export default function PatientRecords() {
  const fileInputRef = useRef(null);

  const [records,         setRecords]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [uploading,       setUploading]       = useState(false);
  const [filter,          setFilter]          = useState('All');
  const [search,          setSearch]          = useState('');
  const [view,            setView]            = useState('grid');
  const [drag,            setDrag]            = useState(false);
  const [sel,             setSel]             = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile,    setSelectedFile]    = useState(null);
  const [error,           setError]           = useState('');
  const [uploadForm,      setUploadForm]      = useState({
    title: '', type: 'Lab Report', doctor: '', hospital: '', notes: '', tags: '', status: 'normal',
  });

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'All') params.type = filter;
      if (search.trim())    params.search = search.trim();
      const res = await recordService.getAll(params);
      setRecords(res.data?.records || []);
    } catch (err) {
      console.error('Load records error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, [filter, search]);

  // When a file is picked — open the upload details modal
  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    // Pre-fill title from filename
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    setUploadForm(p => ({ ...p, title: nameWithoutExt }));
    setError('');
    setShowUploadModal(true);
  };

  // Submit upload to backend → Cloudinary
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    if (!uploadForm.title.trim()) { setError('Title is required'); return; }

    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file',     selectedFile);
      fd.append('title',    uploadForm.title.trim());
      fd.append('type',     uploadForm.type);
      fd.append('status',   uploadForm.status);
      if (uploadForm.doctor)   fd.append('doctor',   uploadForm.doctor);
      if (uploadForm.hospital) fd.append('hospital', uploadForm.hospital);
      if (uploadForm.notes)    fd.append('notes',    uploadForm.notes);
      if (uploadForm.tags)     fd.append('tags',     uploadForm.tags);

      await recordService.upload(fd);

      // Reset
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({ title: '', type: 'Lab Report', doctor: '', hospital: '', notes: '', tags: '', status: 'normal' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadRecords();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed. Check your Cloudinary credentials and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    try {
      await recordService.delete(id);
      setSel(null);
      await loadRecords();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="pr-page">

      {/* Hidden file input — triggered programmatically */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={e => handleFileSelect(e.target.files[0])}
      />

      {/* Upload zone */}
      <div
        className={`upload-zone card ${drag ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => {
          e.preventDefault();
          setDrag(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFileSelect(file);
        }}
      >
        <span className="upload-cloud">☁️</span>
        <h3>Drop your medical records here</h3>
        <p>Supports PDF, JPG, PNG · Max 50 MB per file</p>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse Files
        </button>
        <div className="upload-formats">
          {['PDF', 'JPG', 'PNG'].map(f => <span key={f} className="badge badge-muted">{f}</span>)}
        </div>
      </div>

      {/* Controls */}
      <div className="pr-controls">
        <div className="pr-search">
          <span>🔍</span>
          <input
            placeholder="Search records…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="pr-filters">
          {TYPES.map(t => (
            <button key={t} className={`filter-pill ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
        <div className="view-toggle">
          <button className={`btn btn-icon ${view === 'grid' ? 'vt-active' : ''}`} onClick={() => setView('grid')}>⊞</button>
          <button className={`btn btn-icon ${view === 'list' ? 'vt-active' : ''}`} onClick={() => setView('list')}>☰</button>
        </div>
      </div>

      <p className="pr-count">
        {loading ? 'Loading…' : `${records.length} record${records.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Empty state */}
      {!loading && records.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>No records yet</p>
          <p style={{ fontSize: 13 }}>Upload your first medical record using the area above.</p>
        </div>
      )}

      {/* Grid view */}
      {!loading && view === 'grid' && records.length > 0 && (
        <div className="pr-grid">
          {records.map((r, i) => (
            <div key={r._id} className="pr-card card" style={{ animationDelay: `${i * .05}s` }} onClick={() => setSel(r)}>
              <div className="prc-top">
                <span className="prc-type-icon">{typeIcon[r.type] || '📄'}</span>
                <span className={`badge badge-${stMap[r.status] || 'muted'}`}>{r.status}</span>
              </div>
              <h3 className="prc-name">{r.title}</h3>
              <p className="prc-type">{r.type}</p>
              <div className="prc-meta">
                <span>📅 {new Date(r.recordDate).toLocaleDateString('en-IN')}</span>
                <span>💾 {r.fileSize ? (r.fileSize / 1024 / 1024).toFixed(1) + ' MB' : '—'}</span>
              </div>
              <p className="prc-doctor">{r.doctor || 'No doctor noted'}</p>
              <div className="prc-actions">
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  onClick={e => e.stopPropagation()}
                >
                  ⬇ View
                </a>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={e => { e.stopPropagation(); handleDelete(r._id); }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {!loading && view === 'list' && records.length > 0 && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Document</th><th>Type</th><th>Doctor</th><th>Date</th><th>Size</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r._id} onClick={() => setSel(r)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{typeIcon[r.type] || '📄'}</span>
                      <span style={{ fontWeight: 500 }}>{r.title}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-muted">{r.type}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.doctor || '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(r.recordDate).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.fileSize ? (r.fileSize / 1024 / 1024).toFixed(1) + ' MB' : '—'}</td>
                  <td><span className={`badge badge-${stMap[r.status] || 'muted'}`}>{r.status}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View</a>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Upload Details Modal ── */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}>
          <div className="modal-box card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Upload Record</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  📎 {selectedFile?.name} ({selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB' : ''})
                </p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}>✕</button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      placeholder="e.g. Blood Test Report"
                      value={uploadForm.title}
                      onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                      required
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label>Record Type *</label>
                      <select
                        value={uploadForm.type}
                        onChange={e => setUploadForm(p => ({ ...p, type: e.target.value }))}
                      >
                        {TYPES.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={uploadForm.status}
                        onChange={e => setUploadForm(p => ({ ...p, status: e.target.value }))}
                      >
                        <option value="normal">Normal</option>
                        <option value="review">Review</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label>
                    <input
                      placeholder="blood, routine, diabetes"
                      value={uploadForm.tags}
                      onChange={e => setUploadForm(p => ({ ...p, tags: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Any additional notes about this record…"
                      value={uploadForm.notes}
                      onChange={e => setUploadForm(p => ({ ...p, notes: e.target.value }))}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {error && (
                    <div style={{ background: 'var(--danger-light)', border: '1px solid rgba(232,69,69,.3)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 13, color: 'var(--danger)' }}>
                      ⚠️ {error}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? '⏳ Uploading to Cloudinary…' : '☁️ Upload Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Record Detail Modal ── */}
      {sel && (
        <div className="modal-overlay" onClick={() => setSel(null)}>
          <div className="modal-box card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 34 }}>{typeIcon[sel.type] || '📄'}</span>
                <div>
                  <h2>{sel.title}</h2>
                  <span className="badge badge-muted" style={{ marginTop: 6 }}>{sel.type}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSel(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {[
                  ['Doctor',    sel.doctor   || '—'],
                  ['Hospital',  sel.hospital || '—'],
                  ['Date',      new Date(sel.recordDate).toLocaleDateString('en-IN')],
                  ['File Size', sel.fileSize ? (sel.fileSize / 1024 / 1024).toFixed(2) + ' MB' : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="detail-item"><span>{k}</span><strong>{v}</strong></div>
                ))}
                <div className="detail-item">
                  <span>Status</span>
                  <span className={`badge badge-${stMap[sel.status] || 'muted'}`}>{sel.status}</span>
                </div>
              </div>
              {sel.notes && (
                <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)', padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--r)', borderLeft: '3px solid var(--primary)' }}>
                  {sel.notes}
                </p>
              )}
              {sel.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                  {sel.tags.map(t => <span key={t} className="badge badge-muted">#{t}</span>)}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <a href={sel.fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary">⬇ Open File</a>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(sel._id)}>🗑 Delete</button>
              <button className="btn btn-ghost" onClick={() => setSel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}