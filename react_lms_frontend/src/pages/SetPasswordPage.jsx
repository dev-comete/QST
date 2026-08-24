import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Remplacez par votre vrai service API
import { AuthService } from '../api/auth.service'; 

export default function SetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [passwords, setPasswords] = useState({ new_password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.new_password !== passwords.confirm_password) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    setLoading(true);
    try {
      // Appel à votre endpoint Django qui valide l'UID, le Token et sauvegarde le MDP
      await AuthService.confirmPasswordReset({
        uid,
        token,
        new_password: passwords.new_password
      });
      
      alert("Votre compte est activé ! Vous pouvez vous connecter.");
      navigate('/login');
    } catch (err) {
      setError("Le lien est invalide ou a expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lms-scope">
      <div className="lms-page lms-page--narrow" style={{ alignItems: 'center' }}>
        <div className="lms-container lms-container--sm">
          
          <div className="lms-authcard">
            <div className="lms-brandmark">
              {/* Utilisez votre logo ici */}
              <div className="lms-brandmark__glyph">Q</div>
            </div>
            
            <h1 className="lms-pageheader__title" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              Activez votre compte
            </h1>

            {error && <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="lms-field">
                <label className="lms-label">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  name="new_password" 
                  value={passwords.new_password} 
                  onChange={handleChange} 
                  required 
                  className="lms-input"
                  minLength={8}
                />
              </div>

              <div className="lms-field">
                <label className="lms-label">Confirmez le mot de passe</label>
                <input 
                  type="password" 
                  name="confirm_password" 
                  value={passwords.confirm_password} 
                  onChange={handleChange} 
                  required 
                  className="lms-input"
                />
              </div>

              <button 
                type="submit" 
                className="lms-btn lms-btn--primary lms-btn--block" 
                disabled={loading}
                style={{ marginTop: 'var(--space-2)' }}
              >
                {loading ? 'Activation...' : 'Valider et me connecter'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}