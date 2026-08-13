import { useLogin } from "../../../other/hooks/auth/useAuth";
import Button from "../../../system/atoms/Button/Button";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import Input from "../../../system/atoms/Form/Input";

const Login = () => {

	const { handleSubmit } = useLogin()

    return (
        <Box direction="column" className="flex items-center justify-center h-screen">
			<Paper color="primary" className="p-5">
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
						<Button type="submit">SE CONNECTER</Button>
					</Box>
				</form>
			</Paper>
		</Box>
    )
}

export default Login;