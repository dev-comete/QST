import { useState, type ReactNode } from "react";
import type { User } from "../../other/types/common";
import { TokenStorage } from "../../other/services/storage";
import { AuthContext } from "../../other/hooks/useAuth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {

	const [authUser, setAuthUser] = useState<User | null>(() => TokenStorage.getUser())

	return (
		<AuthContext.Provider value={{ authUser, setAuthUser }}>
			{children}
		</AuthContext.Provider>
	);
}

