import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../../other/types/common";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const { data: user = null, isLoading, isError } = useQuery({
		queryKey: ['auth-user'],
		queryFn: checkAuth,
		retry: false,
	});

	useEffect(() => {
		if (isError) {
			//Navigate to error page or show the notification
		}
	}, [isError]);

	return (
		<AuthContext.Provider value={{ user, isLoading }}>
			{isLoading ? <div>Loading session...</div> : children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within an AuthProvider');
		return context;
}