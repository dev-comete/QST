import { createContext, useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { Role, User } from "../../types/common";
import { AuthService } from "../../services/auth/authService";
import { TokenStorage } from "../../services/auth/storage";

interface AuthContextType {
	authUser: User | null;
	setAuthUser : (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within an AuthProvider');
	return context;
}

const getRoleLandingPath = (role: Role) => {
	switch (role) {
		case 'admin':
			return '/admin';
		case 'formateur':
			return '/formateur';
		case 'apprenant':
			return '/';
		default:
			return '/home';
	}
};

const useLogin = () => {
	const navigate = useNavigate();
	const { setAuthUser } = useAuth();
	const [ error, setError ] = useState<string | null>(null)

	const { mutate, status, isPending } = useMutation({
		mutationFn: AuthService.login,
		onSuccess: (data) => {
			setError(null)
			const { user, access, refresh } = data;
			TokenStorage.setAuthData(access, refresh, user);
			setAuthUser(user);
			const path = getRoleLandingPath(user.role)
			navigate(path, { replace: true });
		},
		onError: (err : any) => {
			setError(err.response?.data?.detail || 'Identifiants incorrects. Veuillez réessayer.');
		},
	});

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;
		if (username.trim().length == 0) {
			setError("Le nom d'utilisateur est obligatoire")
			return
		}
		if (password.trim().length == 0) {
			setError("Le mot de passe est obligatoire")
			return
		}
		setError(null)
		mutate({ username, password });
	};

	return {
		status,
		handleSubmit,
		isPending,
		error,
	};
};

const useLogout = () => {
	const navigate = useNavigate();

	return () => {
		TokenStorage.clear();
		navigate("/login", { replace: true });
	};
};

export {
	AuthContext,
	useAuth,
	useLogin,
	useLogout
}