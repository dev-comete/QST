import { useMutation, useQuery } from "@tanstack/react-query"
import { UserService } from "../../services/userService"
import { useState } from "react"
import type { userPayload } from "../../types/userType"

export interface UseUserProps {
	role?: string;
}

export const useUser = ({ role }: UseUserProps = {}) => {

	const [ user, setUser ] = useState<userPayload>({
		username: '',
		email: '',
		type_utilisateur: null,
		organisation: []
	})

	const { mutate, status } = useMutation({
		mutationFn: UserService.create,
		onSuccess: (data) => {
			console.log("User created", data)
		},
		onError: (err) => {
			console.error('Quiz creation failed:', err);
		},
	});

	const getUserQuery = useQuery({
		queryKey: ['users_list', role ?? 'all'],
		queryFn: () => UserService.list(role ? { role } : undefined),
		enabled: role !== undefined // Remove or tweak if you want to fetch even when role is omitted
	});

	const typeUserQuery = useQuery({
		queryKey: ['utilisateur_type_list'],
		queryFn: UserService.type
	})

	const organisationQuery = useQuery({
		queryKey: ['organisation_list'],
		queryFn: UserService.organisationList
	})

	const handleCreateUser = () => {
		mutate(user)
	}

	return {
		handleCreateUser,
		getUserQuery,
		typeUserQuery,
		organisationQuery,
		status,
		user,
		setUser,
	}
}