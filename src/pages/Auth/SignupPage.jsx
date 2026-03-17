import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './AuthPage.css';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [role, setRole]   = useState('patient');
  const [form, setForm]   = useState({ name: '', email: '', phone: '', password: '', confirm: '', specialization: '', hospital: '', registrationNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role, phone: form.phone };
      if (role === 'doctor') {
        payload.specialization      = form.specialization;
        payload.hospital            = form.hospital;
        payload.registrationNumber  = form.registrationNumber;
      }

      const res = await register(payload);
      if (res.success) {
        navigate(`/${role}`);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo">
            <div className="logo-mark">H</div>
            <span>HealthLedger</span>
          </Link>
          <div className="auth-hero-text">
            <h1>Join HealthLedger</h1>
            <p>Create your account and take control of your health records today.</p>
          </div>
          <div className="auth-perks">
            {['✅ Free to create an account', '✅ Unlimited record uploads', '✅ Share with any doctor', '✅ HIPAA compliant storage'].map(p => (
              <div key={p} className="perk-item">{p}</div>
            ))}
          </div>
        </div>
        <div className="auth-bg-blob" />
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap anim-scale">
          <h2>Create account</h2>
          <p className="auth-form-sub">Fill in your details to get started</p>

          <div className="role-selector">
            {['patient', 'doctor'].map(r => (
              <button key={r} type="button" className={`role-btn ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>
                <span>{r === 'patient' ? '🧑‍💼' : '👨‍⚕️'}</span>
                <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full name</label>
              <input placeholder="Your full name" value={form.name} onChange={e => upd('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="you@email.com" value={form.email} onChange={e => upd('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone number</label>
              <input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => upd('phone', e.target.value)} />
            </div>

            {role === 'doctor' && (
              <>
                <div className="form-group">
                  <label>Specialization</label>
                  <input placeholder="e.g. Cardiologist" value={form.specialization} onChange={e => upd('specialization', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Hospital / Clinic</label>
                  <input placeholder="Hospital name" value={form.hospital} onChange={e => upd('hospital', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Registration Number</label>
                  <input placeholder="MCI-XXXX-XXXXX" value={form.registrationNumber} onChange={e => upd('registrationNumber', e.target.value)} />
                </div>
              </>
            )}

            <div className="form-row-2">
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => upd('password', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Confirm password</label>
                <input type="password" placeholder="Repeat password" value={form.confirm} onChange={e => upd('confirm', e.target.value)} required />
              </div>
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}