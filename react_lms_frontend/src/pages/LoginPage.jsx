import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../api/auth.service';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';

// Icônes inline, cohérentes avec le reste du design system.
const IconUser = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
  </svg>
);

const IconLock = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const IconEye = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a15.5 15.5 0 0 1-3.4 4.3M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

const IconLayers = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </svg>
);

const IconChartBar = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </svg>
);

const IconShield = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

// Illustration abstraite (composée entièrement en SVG, aucune photo/stock) :
// une pile de cartes évoquant un tableau de bord de quiz — barème, score, progression.
const DashboardIllustration = () => (
  <svg viewBox="0 0 280 190" width="100%" height="auto" role="presentation">
    <rect x="18" y="46" width="196" height="120" rx="14" style={{ fill: 'rgba(255,255,255,0.06)' }} stroke="rgba(255,255,255,0.18)" />
    <rect x="40" y="24" width="196" height="120" rx="14" style={{ fill: 'rgba(255,255,255,0.1)' }} stroke="rgba(255,255,255,0.22)" />
    <rect x="62" y="4" width="196" height="120" rx="14" style={{ fill: 'var(--color-paper)' }} />

    {/* En-tête de la carte du dessus */}
    <circle cx="86" cy="28" r="6" style={{ fill: 'var(--color-success-light)' }} />
    <path d="m83 28 2 2 4-4" stroke="var(--color-success-strong)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="100" y="24" width="70" height="8" rx="4" style={{ fill: 'var(--color-mist-strong)' }} />

    {/* Barres de progression style barème */}
    <rect x="86" y="48" width="150" height="7" rx="3.5" style={{ fill: 'var(--color-mist-strong)' }} />
    <rect x="86" y="48" width="104" height="7" rx="3.5" style={{ fill: 'var(--color-harbor)' }} />

    <rect x="86" y="64" width="150" height="7" rx="3.5" style={{ fill: 'var(--color-mist-strong)' }} />
    <rect x="86" y="64" width="70" height="7" rx="3.5" style={{ fill: 'var(--color-info)' }} />

    {/* Mini graphique en barres */}
    <rect x="86" y="86" width="12" height="30" rx="3" style={{ fill: 'var(--color-harbor-light)' }} />
    <rect x="104" y="72" width="12" height="44" rx="3" style={{ fill: 'var(--color-harbor)' }} />
    <rect x="122" y="94" width="12" height="22" rx="3" style={{ fill: 'var(--color-harbor-light)' }} />
    <rect x="140" y="60" width="12" height="56" rx="3" style={{ fill: 'var(--color-success)' }} />

    {/* Badge de score */}
    <rect x="176" y="80" width="60" height="36" rx="10" style={{ fill: 'var(--color-success-light)' }} />
    <text x="206" y="102" textAnchor="middle" style={{ fill: 'var(--color-success-strong)', font: '700 15px var(--font-mono)' }}>92%</text>
  </svg>
);

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { loginContext } = useAuth();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Call API Layer
      const data = await AuthService.login(credentials.username, credentials.password);

      // 2. Update Global State & Storage
      loginContext(data.access, data.refresh, data.user);

      // 3. Redirect on success
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lms-scope lms-auth-shell">

      {/* Panneau de marque — masqué en dessous de 940px (voir auth.css) */}
      <aside className="lms-auth-aside">
        <span className="lms-auth-aside__glow lms-auth-aside__glow--one" />
        <span className="lms-auth-aside__glow lms-auth-aside__glow--two" />

        <div className="lms-auth-aside__content">
          <div className="lms-auth-aside__brand">
            <span className="lms-auth-aside__brand-glyph">Q</span>
            <span className="lms-auth-aside__brand-name">QST Platform</span>
          </div>

          <p className="lms-auth-aside__eyebrow">Espace formateur</p>
         
       

          <ul className="lms-auth-feature-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li className="lms-auth-feature">
              <span className="lms-auth-feature__icon"><IconLayers /></span>
              Organisez vos vagues et sessions par formation
            </li>
            <li className="lms-auth-feature">
              <span className="lms-auth-feature__icon"><IconChartBar /></span>
              Suivez la progression et les scores en un coup d'œil
            </li>
            <li className="lms-auth-feature">
              <span className="lms-auth-feature__icon"><IconShield /></span>
              Accès sécurisé
            </li>
          </ul>
        </div>

        <div className="lms-auth-aside__illustration">
          <DashboardIllustration />
        </div>

        <p className="lms-auth-aside__footer">© {new Date().getFullYear()} QST Platform — Espace de gestion pédagogique.</p>
      </aside>

      {/* Panneau de connexion */}
      <main className="lms-auth-main">
        <div className="lms-auth-card">
          <div className="lms-auth-card__header">
            <p className="lms-auth-card__eyebrow">Bon retour</p>
            <h2 className="lms-auth-card__title">Connexion</h2>
            <p className="lms-auth-card__subtitle">Accédez à votre tableau de bord formateur.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="lms-field">
              <label className="lms-label">Nom d'utilisateur</label>
              <div className="lms-input-group">
                <span className="lms-input-group__icon"><IconUser /></span>
                <input
                  type="text"
                  name="username"
                  className="lms-input"
                  value={credentials.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="lms-field">
              <label className="lms-label">Mot de passe</label>
              <div className="lms-input-group lms-input-group--password">
                <span className="lms-input-group__icon"><IconLock /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="lms-input"
                  value={credentials.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="lms-input-group__toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  tabIndex={-1}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="lms-auth-options">
              <label className="lms-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Se souvenir de moi
              </label>
              <Link to="/forgot-password" className="lms-auth-options__link">
                Mot de passe oublié ?
              </Link>
            </div>

            {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

            <button type="submit" className="lms-btn lms-btn--primary lms-btn--block" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="lms-auth-card__footer">
            Besoin d'un accès ? Contactez l'administrateur de votre organisation.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
