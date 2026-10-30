import { createContext, useContext, useState } from "react";
import { useMutation , useQueryClient} from "@tanstack/react-query";
import { useNavigate } from "react-router";
import type { Role, User } from "../../types/common";
import { AuthService } from "../../services/auth/authService";
import { TokenStorage } from "../../services/auth/storage";
import apiClient from "../../services/apiClient";

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
    const { setAuthUser } = useAuth();
    const queryClient = useQueryClient(); 

    return () => {
        // Redirection en premier
        navigate("/login", { replace: true });

        // Nettoyage en arrière-plan pour éviter le clignotement de la page protégée
        setTimeout(() => {
            TokenStorage.clear();
            setAuthUser(null);
            queryClient.clear();
        }, 0);
    };
};

const useResetPassword = (email: string) => {
	const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const passwordMutation = useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post("/accounts/auth/request-password-reset/", {
                email,
            });
            return data;
        },
        onSuccess: (data) => {
            setSuccessMessage(
                data.detail || "Votre demande de réinitialisation a été envoyée à l'administrateur avec succès."
            );
            setErrorMessage("");
        },
        onError: (error: any) => {
            setErrorMessage(
                error.response?.data?.detail || "Une erreur est survenue lors de la soumission de la demande."
            );
            setSuccessMessage("");
        },
    });

	return { successMessage, errorMessage, passwordMutation }
}

export {
	AuthContext,
	useAuth,
	useLogin,
	useLogout,
	useResetPassword,
}