import { useLogin } from "../../../other/hooks/useAuth";
import Button from "../../../system/atoms/Button/Button";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import Input from "../../../system/atoms/Form/Input";

const Login = () => {

	const { mutate } = useLogin()

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;
	
		mutate({ username, password });
	};

    return (
        <Box direction="column" customStyling="flex items-center justify-center h-screen">
			<Paper color="primary" customStyling="p-5">
				<form onSubmit={handleSubmit}>
					<Box direction="column">
						<Input
							id={"username"}
							name={"username"}
							label="Nom d'utilisateur"
							textColor="white"
						/>
						<Input
							id={"password"}
							name={"password"}
							type="password"
							label="Mot de passe"
							textColor="white"
						/>
						<Button action={function (): void {
							throw new Error("Function not implemented.");
						} }>SE CONNECTER</Button>
					</Box>
				</form>
			</Paper>
		</Box>
    )
}

export default Login;