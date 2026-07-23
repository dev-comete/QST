import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../api/auth.service';
import { useAuth } from '../context/AuthContext';

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
    <div className="container" style={{ maxWidth: '400px', marginTop: '10vh' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Connexion LMS</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input 
              type="text" 
              name="username" 
              className="form-control" 
              value={credentials.username} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              name="password" 
              className="form-control" 
              value={credentials.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          {error && <span className="text-danger" style={{ marginBottom: '1rem' }}>{error}</span>}
          
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
