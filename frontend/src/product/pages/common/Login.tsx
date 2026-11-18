import { Navigate } from "react-router";
import { useAuth, useLogin, useResetPassword , useGoogleLogin} from "../../../other/hooks/auth/useAuth";
import { GoogleLogin } from "@react-oauth/google";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import Info from "../../../system/atoms/Form/Info";
import Input from "../../../system/atoms/Form/Input";
import CustomText from "../../../system/atoms/Text/CustomText";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import Logo from "../../../system/molecules/Logo/Logo";
import PasswordInput from "../../../system/molecules/Input/PasswordInput";
import illustration from "../../../assets/illustration.webp"
import { Modal } from "../../../system/molecules/Modal/Modal";
import { useState } from "react";
import { CancelButton } from "../../../system/molecules/Buttons/CustomizedButton";

interface ResetPasswordFormProps {
	email: string
	setEmail: (e: string) => void
	success: string
	error: string
}

const ResetPasswordForm = ({ setEmail, success, error } : ResetPasswordFormProps) => {
	return (
		<Box direction="column" className="gap-3 items-center w-full">
			<Input
				id="email-reset"
				type="email"
				name="email-reset"
				label="Adresse email"
				className="w-full"
				onChange={(e) => setEmail(e.target.value)}
				required
			/>
			{success && <Info info={success}/>}
			{error && <Info info={error} variant='error'/>}
		</Box>
	)
}

const Login = () => {
    const { handleSubmit, isPending, error } = useLogin();
	const { authUser } = useAuth()
	const [ open, setOpen ] = useState(false)
	const [ emailReset, setEmailReset ] = useState('')
	const { passwordMutation, successMessage, errorMessage } = useResetPassword(emailReset)

	const { handleGoogleSuccess, isPending: isGooglePending, error: googleError } = useGoogleLogin();

	if (authUser) return <Navigate to="/" replace />;

    return (
        <Box className="flex relative h-screen p-10 items-center justify-between w-full overflow-hidden">
			<img
				src={illustration}
				alt=""
				fetchPriority="high"
				className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
			/>
			<Modal
				isOpen={open}
				closeModal={() => setOpen(false)}
				title="Réinitialisation de mot de passe"
				footer={
					<Box>
						<CancelButton text="Annuler" onClick={() => setOpen(false)}/>
						<ActionButton
							isLoading={passwordMutation.isPending}
							onClick={() => passwordMutation.mutate()}
						>Confirmer</ActionButton>
					</Box>
				}
			>
				<ResetPasswordForm email={emailReset} setEmail={setEmailReset} success={successMessage} error={errorMessage}/>
			</Modal>
			<Box className="w-full px-10">
				<Box direction="column" className="bg-black/50 justify-center p-10 rounded-xl flex-1">
					<h1 className="text-[50px] text-white font-bold">Bienvenue sur QST</h1>
					<CustomText textTag="h2" color="white" weight="bold">L'évaluation intelligente, simplifiée.</CustomText>
				</Box>
				<Paper color="white" className="w-full max-w-md p-10 shadow-none h-fit">
					<Box direction="column" className="space-y-6 items-center w-full">
						<Box direction="column" className="items-center">
							<Logo />
							<CustomText textTag="h6" isItalic={true}>{"Connectez-vous pour accéder à votre espace."}</CustomText>
						</Box>
						<form onSubmit={handleSubmit} className="w-full">
							<Box direction="column" className="space-y-4 items-center w-full">
								<Input
									id="username"
									name="username"
									label="Nom d'utilisateur"
									className="w-full"
									required
								/>
								<Box direction="column" className="w-full gap-1">
									<PasswordInput
										id="password"
										name="password"
										type="password"
										label="Mot de passe"
										className="w-full"
										required
									/>
									<span
										className="flex self-end text-[11px] cursor-pointer hover:text-primary"
										onClick={() => setOpen(true)}
									>
										Mot de passe oublié?
									</span>
								</Box>
								{ error && <Info info={error} variant="error"/>}
								<ActionButton
									type="submit"
									btnStyling="w-full mt-2"
									isLoading={isPending || isGooglePending}
								>
									SE CONNECTER
								</ActionButton>

								{/* 🆕 Section Google SSO */}
                                <div className="flex items-center justify-between w-full mt-2 mb-2">
                                    <hr className="w-full border-gray-300" />
                                    <span className="px-3 text-sm text-gray-400 bg-white">ou</span>
                                    <hr className="w-full border-gray-300" />
                                </div>

                                {/* 🆕 Bouton de connexion Google */}
                                <div className="flex flex-col items-center w-full">
                                    <GoogleLogin
                                        onSuccess={(credentialResponse) => {
                                            if (credentialResponse.credential) {
                                                handleGoogleSuccess(credentialResponse.credential);
                                            }
                                        }}
                                        onError={() => console.error("Échec de la popup Google")}
                                        useOneTap={true}
                                        theme="outline"
                                        text="continue_with"
                                        shape="rectangular"
                                    />
                                </div>
                                { googleError && <Info info={googleError} variant="error"/>}
							</Box>
						</form>
					</Box>
				</Paper>
			</Box>
        </Box>
    );
};

export default Login;