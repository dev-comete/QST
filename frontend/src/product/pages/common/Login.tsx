import { useLogin } from "../../../other/hooks/auth/useAuth";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import Input from "../../../system/atoms/Form/Input";
import CustomText from "../../../system/atoms/Text/CustomText";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import Logo from "../../../system/molecules/Logo/Logo";

const Login = () => {
    const { handleSubmit, isPending } = useLogin();

    return (
        <Box className="flex h-screen w-full overflow-hidden">

            <Box className="w-full md:w-1/3 h-full flex flex-col justify-center pt-10 p-6 bg-white z-10">
                <Paper color="white" className="w-full max-w-md p-8 shadow-none">
                    <Box direction="column" className="space-y-6 items-center w-full">
                        <Box direction="column" className="items-center">
                            <Logo />
                            <CustomText textTag="h6" isItalic={true}>{"Entrez dans l'espace de création et d'évaluation de vos connaissances."}</CustomText>
                        </Box>
                        <form onSubmit={handleSubmit} className="w-full">
                            <Box direction="column" className="space-y-4 items-center w-full">
                                <Input
                                    id="username"
                                    name="username"
                                    label="Nom d'utilisateur"
                                    className="w-full"
                                />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    label="Mot de passe"
                                    className="w-full"
                                />
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

            <Box className="hidden md:block md:w-2/3 h-full relative">
                <img 
                    src="/src/assets/illustration.jpg" 
                    alt="Login illustration" 
                    className="w-full h-full object-cover"
                />
            </Box>
        </Box>
    );
};

export default Login;