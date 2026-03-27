import './HomePage.css';
import { Link } from 'react-router';
import DiscordButtonAuth from '../../components/DiscordButtonAuth/DiscordButtonAuth';
import { useAuth } from '../../hooks/useAuth';

export function HomePage() {
  const { isLogged } = useAuth();
  const dashboardButton = isLogged ? (
    <Link to="/dashboard" className="btn btn-secondary dashboard-button">
      <span className="material-symbols-outlined icon-filled">space_dashboard</span>
      Dashboard
    </Link>
  ) : null;
  const authAction = isLogged ? dashboardButton : <DiscordButtonAuth />;

  return (
    <>
      <nav className="guardian-nav guardian-container">
        <div className="flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span className="nav-brand">Eldon.ai</span>
        </div>
        <div className="nav-actions">
          {authAction}
        </div>
      </nav>

      <main className="main-content guardian-container">
        {/* Hero Section */}
        <section className="hero-section editorial-grid">
          <div className="hero-text-col">
            <div className="badge">
              <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--secondary)' }}>
                shield_person
              </span>
              <span className="badge-text">24/7 Voice Protection</span>
            </div>
            
            <h1 className="hero-title">
              Eldon.ai: The <span className="text-tertiary">Friendly</span> Guardian of Your Voice Channels
            </h1>
            
            <p className="hero-subtitle">
              Eldon listens to your voice chats in real-time to prevent toxicity and ensure every conversation stays positive. Because safety should feel like a friend, not a robot.
            </p>
            
            <div className="hero-actions">
              {authAction}
            </div>
          </div>
          
          <div className="hero-img-col">
            <div className="hero-glow"></div>
            <div className="hero-img-wrapper">
              <img 
                className="hero-image" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1QR1l3QvPDDLjEux5ArWjKWe_hW4rb5e2FktB04AQQioNVd6PBRKLvGo4Q563M_b8YqxtEZl1d0xyxwqnsphrLy4Wtj-FAIDMQCHujY9Jly2yopIjPRvomBMJsygNJ7lIHWRmIyinWfJPoJ72_l3NNHKcJU88bFT0Wp8hev09XEvKMEyqdw1eyPruGrL8X3ej_BjkTpMOSl7Lo5pdU2P1dfZcCMPzWseoCHKSYzB0khODZ-fmvEhp_oYYKbdrU5ESRfE7AfXdfww" 
                alt="Eldon Mascot" 
              />
              
              <div className="pulse-monitor glass-card">
                <div className="pulse-bar h-1 pulse-anim"></div>
                <div className="pulse-bar h-2"></div>
                <div className="pulse-bar h-3 pulse-anim"></div>
                <div className="pulse-bar h-4"></div>
                <div className="pulse-bar h-5 pulse-anim"></div>
                <span className="pulse-label">Live Analysis</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works">
          <div className="section-header">
            <h2 className="section-title">How Eldon Helps</h2>
            <p className="hero-subtitle" style={{ margin: '0 auto' }}>Three simple steps to a safer, friendlier server community.</p>
          </div>
          
          <div className="steps-grid">
            <div className="step-card step-card-1">
              <div className="step-icon-wrapper">
                <span className="material-symbols-outlined icon-filled step-icon-1">person_add</span>
              </div>
              <h3 className="step-title">1. Add Eldon</h3>
              <p className="step-desc">Invite Eldon to your server with one click. He's lightweight and respects your permissions.</p>
            </div>
            
            <div className="step-card step-card-2">
              <div className="step-icon-wrapper">
                <span className="material-symbols-outlined icon-filled step-icon-2">mic</span>
              </div>
              <h3 className="step-title">2. Join a Voice Channel</h3>
              <p className="step-desc">Simply jump into any VC. Eldon joins automatically to keep the vibes positive and safe.</p>
            </div>
            
            <div className="step-card step-card-3">
              <div className="step-icon-wrapper">
                <span className="material-symbols-outlined icon-filled step-icon-3">sentiment_very_satisfied</span>
              </div>
              <h3 className="step-title">3. Stay Happy</h3>
              <p className="step-desc">Eldon listens for toxic patterns and intervenes gently, ensuring everyone is having a good time.</p>
            </div>
          </div>
        </section>

        {/* Why Voice Channels Section */}
        <section className="feature-section editorial-grid">
          <div className="feature-text-col">
            <h2 className="feature-title">Why Voice Channels?</h2>
            
            <p className="hero-subtitle">
              Verbal interactions are where the magic of community happens—but they're also where toxicity often hides behind the lack of a paper trail.
            </p>
            <p className="hero-subtitle">
              Standard bots only check text. Eldon bridges the gap, monitoring the spoken word to protect your members from harassment and bullying in real-time.
            </p>
            
            <div className="feature-stats">
              <div className="stat-item">
                <span className="stat-val c-secondary">98%</span>
                <span className="stat-label">Toxicity Reduction</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-val c-primary">24/7</span>
                <span className="stat-label">Active Monitoring</span>
              </div>
            </div>
          </div>
          
          <div className="feature-img-col">
            <img 
              className="feature-image" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZUbA4Zh24-U_Cnk5AjeeJ_rirBzxfXE-uCwgYvjfvi90oDoBusRVtd-NuBEcQyu5ylvpRtcSvBQ2Vt9ErcWjs-ff90MG1VjxeMlbvSGv2HgqgXpngz4msj27vp7cNsP2-4lx3x7fLmPnLTWfYr7vd6apoLxjhc7axUVN4KqWApf99VtDWdVQrdeVP5bVoOvnxnxa3VoUkd3Syve3ciInAcrhRljJV9EhvS_INKbbF-7C0JSZ-VesaGT_c9sUoEM83DttLSM8vHF8" 
              alt="Voice Channel Protection" 
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-bg">
            <div className="cta-blob-1"></div>
            <div className="cta-blob-2"></div>
          </div>
          
          <div className="cta-content">
            <h2 className="cta-title">Ready to protect your server?</h2>
            <p className="cta-subtitle">Join the community making voice channels a safer space with Eldon.</p>
            
            <button className="btn btn-alert">
              <span className="material-symbols-outlined icon-filled" style={{ marginRight: '1rem' }}>bolt</span>
              Get Started Now
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="guardian-footer">
        <div className="footer-brand-col">
          <span className="footer-brand">Eldon.ai</span>
          <p className="footer-copyright">© 2024 Eldon.ai - Your Friendly Guardian</p>
        </div>
        
        <div className="footer-links">
          <a className="footer-link" href="#">Privacy</a>
          <a className="footer-link" href="#">Terms</a>
          <a className="footer-link" href="#">Support</a>
          <a className="footer-link" href="#">Twitter</a>
        </div>
        
        <div className="footer-status">
          <div className="status-dot pulse-anim"></div>
          <span className="status-text">System Online</span>
        </div>
      </footer>
    </>
  );
}
