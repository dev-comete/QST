import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { UserService } from '../../../other/services/userService';
import Logo from '../../../system/molecules/Logo/Logo';

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
      await UserService.confirmPasswordReset({
        uid,
        token,
        new_password: passwords.new_password
      });
      
    //   notify({ type: 'success', message: 'Votre compte est activé ! Vous pouvez vous connecter.' });
      navigate('/login');
    } catch (err) {
      setError("Le lien est invalide ou a expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center h-[100vh] bg-background">
      <div className="flex flex-col w-1/2 m-auto space-y-5 bg-white rounded-xl p-5">
        <div className="flex flex-col items-center gap-3">
          
          <div className="flex flex-col items-center gap-5">
            <div className="lms-brandmark">
				<Logo />
            </div>
            
            <h1 className="text-primary font-bold uppercase" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              Activez votre compte
            </h1>

            {error && <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>{error}</div>}

            <form onSubmit={handleSubmit} className='flex flex-col gap-3 items-start'>
              <div className="flex gap-2">
                <label className="lms-label">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  name="new_password" 
                  value={passwords.new_password} 
                  onChange={handleChange} 
                  required 
                  className="border border-background"
                  minLength={8}
                />
              </div>

              <div className="flex gap-2 items-center">
                <label className="lms-label">Confirmez le mot de passe</label>
                <input 
                  type="password" 
                  name="confirm_password" 
                  value={passwords.confirm_password} 
                  onChange={handleChange} 
                  required 
                  className="border border-background"
                />
              </div>

              <button 
                type="submit" 
                className="bg-primary rounded-xl p-2 text-white self-center" 
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