import { createContext, useContext } from "react";
import type { User } from "../types/common";
import { useMutation } from "@tanstack/react-query";
import { TokenStorage } from "../services/storage";
import { AuthService } from "../services/authService";

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

const useLogin = () => {
	const { mutate, status } = useMutation({
		mutationFn: AuthService.login,
		onSuccess: (data) => {
			const { user, access, refresh } = data
			TokenStorage.setAuthData(access, refresh, user);
		},
		onError: (err) => {
			console.error('Login failed:', err);
		},
	});

	return {
		status,
		mutate
	}
}

const useLogout = () => {

}

export {
	AuthContext,
	useAuth,
	useLogin,
	useLogout
}