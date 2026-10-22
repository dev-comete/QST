import { useEffect, useState } from 'react';
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
	const { authUser } = useAuth()

	const [passwords, setPasswords] = useState({ new_password: '', confirm_password: '' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	if (authUser) return <Unauthorized />

	const handleChange = (e : any) => {
		setPasswords({ ...passwords, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e : any) => {
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

	const checkPasswordValidation = () => {
		if (!passwords.new_password || !passwords.confirm_password)
			return false
		if (passwords.new_password.length < 8 || passwords.confirm_password.length < 8)
			return false
		if (passwords.new_password != passwords.confirm_password)
			return false
		return true
	}

	return (
	<div className="flex w-full items-center justify-center h-[100vh] bg-background">
		<div className="flex flex-col w-1/2 m-auto space-y-5 bg-white rounded-xl p-5">			
			<div className="flex flex-col items-center gap-5 w-full">
				<Logo />
				<CustomText className='uppercase' weight='bold' textTag='h3' color='primary'>Activez votre compte</CustomText>
				<CustomText isItalic>Veuillez créez votre mot de passe. Il doit contenir au moins 8 caractères. </CustomText>
				<div>
					{ error && <Info info={error} variant="error"/>}
				</div>
				<form onSubmit={handleSubmit}>
					<Box direction='column' className='gap-5 items-center'>
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
							disabled={checkPasswordValidation() == false}
						>
							Valider et me connecter
						</ActionButton>
					</Box>
				</form>
			</div>
		</div>
	</div>
	);
}