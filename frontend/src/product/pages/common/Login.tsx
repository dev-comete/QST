import { Navigate } from "react-router";
import { useAuth, useLogin } from "../../../other/hooks/auth/useAuth";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import Info from "../../../system/atoms/Form/Info";
import Input from "../../../system/atoms/Form/Input";
import CustomText from "../../../system/atoms/Text/CustomText";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import Logo from "../../../system/molecules/Logo/Logo";
import PasswordInput from "../../../system/molecules/Input/PasswordInput";

const Login = () => {
    const { handleSubmit, isPending, error } = useLogin();
	const { authUser } = useAuth()

	if (authUser) return <Navigate to="/" replace />;

    return (
        <Box
            className="flex h-screen p-10 items-center justify-between w-full overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url("/src/assets/illustration.png")' }}
        >
			<Box className="w-full px-10">
				<Box direction="column" className="bg-black/50 justify-center p-10 rounded-xl flex-1">
					<h1 className="text-[50px] text-white font-bold">Bienvenue sur QST</h1>
					<CustomText textTag="h2" color="white" weight="bold">Gérez vos quiz en toute efficacité</CustomText>
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
								<PasswordInput
									id="password"
									name="password"
									type="password"
									label="Mot de passe"
									className="w-full"
									required
								/>
								{ error && <Info info={error} variant="error"/>}
								<ActionButton
									type="submit"
									btnStyling="w-full mt-2"
									isLoading={isPending}
								>
									SE CONNECTER
								</ActionButton>
							</Box>
						</form>
					</Box>
				</Paper>
			</Box>
        </Box>
    );
};

export default Login;