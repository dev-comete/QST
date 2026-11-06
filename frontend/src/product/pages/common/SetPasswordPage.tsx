import React, { useEffect, useState } from 'react'; 
import { useNavigate, useParams } from 'react-router';
import { UserService } from '../../../other/services/userService';
import Logo from '../../../system/molecules/Logo/Logo';
import { useAuth } from '../../../other/hooks/auth/useAuth';
import Unauthorized from './Unauthorized';
import PasswordInput from '../../../system/molecules/Input/PasswordInput';
import Box from '../../../system/atoms/Container/Box';
import ActionButton from '../../../system/molecules/Buttons/ActionButton';
import Info from '../../../system/atoms/Form/Info';
import CustomText from '../../../system/atoms/Text/CustomText';

export default function SetPasswordPage() {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const { authUser } = useAuth();

    const [passwords, setPasswords] = useState({ new_password: '', confirm_password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // État de chargement initial pour la vérification du lien
    const [isCheckingLink, setIsCheckingLink] = useState(true);
    const [isLinkExpired, setIsLinkExpired] = useState(false);
    
    const [email, setEmail] = useState('');
    const [newLinkRequested, setNewLinkRequested] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // VÉRIFICATION DÈS LE CHARGEMENT DE LA PAGE
    useEffect(() => {
        if (!uid || !token) return;

        let isMounted = true;

        const validateLink = async () => {
            try {
                await UserService.validatePasswordResetLink({ uid, token });
                if (isMounted) setIsLinkExpired(false);
            } catch (err: any) {
                if (isMounted) {
                    setIsLinkExpired(true);
                    setError(err.response?.data?.error || "Ce lien est invalide ou a expiré.");
                }
            } finally {
                if (isMounted) setIsCheckingLink(false);
            }
        };

        validateLink();

        return () => { isMounted = false; };
    }, [uid, token]);

    if (authUser) return <Unauthorized />;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (passwords.new_password !== passwords.confirm_password) {
            return setError("Les mots de passe ne correspondent pas.");
        }

        setLoading(true);
        try {
            if (uid && token) {
                await UserService.confirmPasswordReset({
                    uid,
                    token,
                    new_password: passwords.new_password
                });
            }
            navigate('/login');
        } catch (err: any) {
            if (err.response && err.response.status === 400) {
                setIsLinkExpired(true);
                setError(err.response.data?.error || "Ce lien est invalide ou a expiré.");
            } else {
                setError("Une erreur est survenue lors de l'activation.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRequestNewLink = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await UserService.requestNewPasswordLink({ email });
            setNewLinkRequested(true);
            setSuccessMessage(response.detail || "Votre demande a été envoyée.");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Erreur lors de la demande. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const checkPasswordValidation = () => {
        if (!passwords.new_password || !passwords.confirm_password) return false;
        if (passwords.new_password.length < 8 || passwords.confirm_password.length < 8) return false;
        if (passwords.new_password !== passwords.confirm_password) return false;
        return true;
    };

    // 1. ÉCRAN DE CHARGEMENT INITIAL (pendant qu'on vérifie le lien)
    if (isCheckingLink) {
        return (
            <div className="flex w-full items-center justify-center h-[100vh] bg-background">
                <div className="flex flex-col w-1/2 m-auto space-y-5 bg-white rounded-xl p-5 text-center">
                    <Logo />
                    <CustomText className='uppercase mt-4' weight='bold' textTag='h3' color='primary'>
                        Vérification de votre lien...
                    </CustomText>
                </div>
            </div>
        );
    }

    // 2. ÉCRAN DE SUCCÈS APRÈS DEMANDE DE NOUVEAU LIEN
    if (newLinkRequested) {
        return (
            <div className="flex w-full items-center justify-center h-[100vh] bg-background">
                <div className="flex flex-col w-1/2 m-auto space-y-5 bg-white rounded-xl p-5 text-center">          
                    <Logo />
                    <CustomText className='uppercase' weight='bold' textTag='h3' color='primary'>
                        Demande envoyée
                    </CustomText>
                    <Info info={successMessage} variant="info" />
                    <ActionButton onClick={() => navigate('/login')} className="mt-4">
                        Retour à la connexion
                    </ActionButton>
                </div>
            </div>
        );
    }

    // 3. ÉCRAN PRINCIPAL (Lien expiré OU Formulaire normal)
    return (
        <div className="flex w-full items-center justify-center h-[100vh] bg-background">
            <div className="flex flex-col w-1/2 m-auto space-y-5 bg-white rounded-xl p-5">          
                <div className="flex flex-col items-center gap-5 w-full">
                    <Logo />
                    
                    <CustomText className='uppercase text-center' weight='bold' textTag='h3' color='primary'>
                        {isLinkExpired ? "Lien expiré" : "Activez votre compte"}
                    </CustomText>
                    
                    <CustomText isItalic className="text-center">
                        {isLinkExpired 
                            ? "Ce lien d'activation n'est plus valide. Entrez votre adresse e-mail pour en demander un nouveau." 
                            : "Veuillez créer votre mot de passe. Il doit contenir au moins 8 caractères."
                        }
                    </CustomText>
                    
                    <div className="w-full">
                        {error && <Info info={error} variant="error"/>}
                    </div>

                    {isLinkExpired ? (
                        <form onSubmit={handleRequestNewLink} className="w-full">
                            <Box direction='column' className='gap-5 items-center'>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Votre adresse e-mail"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <ActionButton type='submit' isLoading={loading} disabled={!email}>
                                    Demander un nouveau lien
                                </ActionButton>
                            </Box>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="w-full">
                            <Box direction='column' className='gap-5 items-center w-full'>
                                <PasswordInput
                                    id="new_password"
                                    name="new_password"
                                    type="password"
                                    label="Nouveau mot de passe"
                                    className="w-full"
                                    required
                                    onChange={handleChange}
                                    value={passwords.new_password}
                                    min={8}
                                />
                                <PasswordInput
                                    id="confirm_password"
                                    name="confirm_password"
                                    type="password"
                                    label="Confirmation du mot de passe"
                                    className="w-full"
                                    required
                                    onChange={handleChange}
                                    value={passwords.confirm_password}
                                    min={8}
                                />
                                <ActionButton
                                    type='submit'
                                    isLoading={loading}
                                    disabled={checkPasswordValidation() === false}
                                >
                                    Valider et me connecter
                                </ActionButton>
                            </Box>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}