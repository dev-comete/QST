import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../api/auth.service';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
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
    <div className="lms-scope lms-page lms-page--narrow">
      <div className="lms-container--sm" style={{ width: '100%' }}>
        <div className="lms-brandmark">
          <span className="lms-brandmark__glyph">L</span>
        </div>

        <div className="lms-authcard">
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>Connexion QST</h2>

          <form onSubmit={handleSubmit}>
            <div className="lms-field">
              <label className="lms-label">Nom d'utilisateur</label>
              <input
                type="text"
                name="username"
                className="lms-input"
                value={credentials.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="lms-field">
              <label className="lms-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                className="lms-input"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

            <button type="submit" className="lms-btn lms-btn--primary lms-btn--block" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
