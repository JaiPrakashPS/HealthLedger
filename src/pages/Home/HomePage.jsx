import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const features = [
  { icon: '🔒', title: 'Secure Document Vault',  desc: 'AES-256 encrypted storage on AWS S3. Your records are protected with military-grade security.' },
  { icon: '🔗', title: 'Smart Access Links',      desc: 'Generate time-limited links to share specific records with any doctor, anywhere — with full control.' },
  { icon: '🕐', title: 'Medical Timeline',        desc: 'See your entire health history in one beautiful chronological view. Never miss context again.' },
  { icon: '👨‍⚕️', title: 'Doctor Collaboration',  desc: 'Doctors get instant, secure access to the records they need, without chasing paperwork.' },
  { icon: '📅', title: 'Appointment Management', desc: 'Book, reschedule and track appointments across all your healthcare providers in one place.' },
  { icon: '📊', title: 'Health Analytics',        desc: 'Visualise trends across your health history. Empower smarter conversations with your doctors.' },
];

const roles = [
  {
    role: 'patient',
    icon: '🧑‍💼',
    title: 'I\'m a Patient',
    desc: 'Upload, organise and share your medical records securely with any doctor.',
    color: 'blue',
    cta: 'Access Patient Portal',
  },
  {
    role: 'doctor',
    icon: '👨‍⚕️',
    title: 'I\'m a Doctor',
    desc: 'View shared patient records instantly. No more chasing reports before appointments.',
    color: 'teal',
    cta: 'Access Doctor Portal',
  },
  {
    role: 'admin',
    icon: '🏥',
    title: 'Hospital Admin',
    desc: 'Manage users, audit access logs, and keep your system running smoothly.',
    color: 'purple',
    cta: 'Access Admin Panel',
  },
];

const stats = [
  { value: '50,000+', label: 'Patients Registered' },
  { value: '1.2M+',   label: 'Records Stored' },
  { value: '8,400+',  label: 'Doctors Onboarded' },
  { value: '99.99%',  label: 'Uptime SLA' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* ── Nav ── */}
      <nav className="home-nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="logo-mark">H</div>
            <span>HealthVault</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#roles">Portals</a>
          </div>
          <div className="nav-cta">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Log in</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob blob-1" />
          <div className="hero-blob blob-2" />
          <div className="hero-grid" />
        </div>
        <div className="hero-content">
          <div className="hero-badge anim-fade-up">
            <span className="badge badge-accent">🇮🇳 Built for India's Healthcare</span>
          </div>
          <h1 className="hero-title anim-fade-up" style={{ animationDelay: '.1s' }}>
            Your entire medical<br />
            history, <span className="hero-gradient">always with you</span>
          </h1>
          <p className="hero-sub anim-fade-up" style={{ animationDelay: '.2s' }}>
            HealthVault is a secure digital health record manager that lets patients store,
            organise and share their medical history with any doctor — instantly.
          </p>
          <div className="hero-actions anim-fade-up" style={{ animationDelay: '.3s' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
              Start for free →
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
          <div className="hero-trust anim-fade-up" style={{ animationDelay: '.4s' }}>
            <span>🔒 HIPAA Compliant</span>
            <span>•</span>
            <span>☁️ AWS Secured</span>
            <span>•</span>
            <span>🇮🇳 Made in India</span>
          </div>
        </div>

        {/* Hero card mockup */}
        <div className="hero-visual anim-fade-up" style={{ animationDelay: '.35s' }}>
          <div className="mockup-card card">
            <div className="mc-header">
              <div className="mc-avatar avatar" style={{ width:42, height:42, background:'linear-gradient(135deg,#0A6EBD,#00C9A7)', color:'#fff', fontSize:16 }}>RS</div>
              <div>
                <p className="mc-name">Ravi Shankar</p>
                <p className="mc-id">PID · 2024-0847</p>
              </div>
              <span className="badge badge-success" style={{marginLeft:'auto'}}>Active</span>
            </div>
            <div className="mc-stats">
              {[['24','Records'],['3','Active Links'],['7','Doctors']].map(([v,l])=>(
                <div key={l} className="mc-stat">
                  <span className="mc-stat-val">{v}</span>
                  <span className="mc-stat-label">{l}</span>
                </div>
              ))}
            </div>
            <div className="mc-records">
              {['Blood Test Report','Chest X-Ray','ECG Report'].map((r,i)=>(
                <div key={r} className="mc-record-row">
                  <span className="mc-file-icon">📄</span>
                  <span className="mc-record-name">{r}</span>
                  <span className="badge badge-muted" style={{fontSize:10}}>{['Lab','Radiology','Cardiology'][i]}</span>
                </div>
              ))}
            </div>
            <div className="mc-link-row">
              <span>🔗 Shared with Dr. Priya Kumar</span>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-band">
        <div className="stats-inner">
          {stats.map((s,i) => (
            <div className="stat-item" key={i}>
              <p className="stat-val">{s.value}</p>
              <p className="stat-lbl">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <div className="section-tag">Features</div>
          <h2 className="section-title">Everything your health records need</h2>
          <p className="section-sub">One secure platform for patients, doctors, and hospitals.</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card card" key={i} style={{ animationDelay: `${i * .07}s` }}>
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section" id="how">
        <div className="section-inner">
          <div className="section-tag">How it works</div>
          <h2 className="section-title">From upload to doctor in 3 steps</h2>
          <div className="steps-row">
            {[
              { n:'01', icon:'📤', title:'Upload your records', desc:'Upload any medical document — prescriptions, lab reports, scans — in seconds.' },
              { n:'02', icon:'🔗', title:'Generate a secure link', desc:'Pick which records to share, set an expiry date and send the link directly to your doctor.' },
              { n:'03', icon:'👨‍⚕️', title:'Doctor views instantly', desc:'Your doctor opens the link, sees exactly what they need, and treats you better.' },
            ].map((s,i)=>(
              <div className="step-card" key={i}>
                <div className="step-num">{s.n}</div>
                <span className="step-icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < 2 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role cards ── */}
      <section className="roles-section" id="roles">
        <div className="section-inner">
          <div className="section-tag">Portals</div>
          <h2 className="section-title">Choose your portal</h2>
          <p className="section-sub">Three tailored experiences — for patients, doctors, and hospital admins.</p>
          <div className="roles-grid">
            {roles.map((r) => (
              <div className={`role-card role-${r.color}`} key={r.role}>
                <span className="role-icon">{r.icon}</span>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
                <button className="btn btn-dark" onClick={() => navigate('/login', { state: { role: r.role } })}>
                  {r.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="cta-inner">
          <h2>Ready to take control of your health records?</h2>
          <p>Join 50,000+ patients who already trust HealthVault.</p>
          <div className="cta-btns">
            <button className="btn btn-white btn-lg" onClick={() => navigate('/signup')}>Create free account</button>
            <button className="btn btn-outline btn-lg" style={{borderColor:'rgba(255,255,255,.5)',color:'#fff'}} onClick={() => navigate('/login')}>Sign in</button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="logo-mark sm">H</div>
            <span>HealthVault</span>
          </div>
          <p>© 2025 HealthVault. HIPAA Compliant · Secured by AWS · Made in India 🇮🇳</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}