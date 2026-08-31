import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserService } from "../../services/userService"
import { useState } from "react"
import type { userPayload } from "../../types/userType"

export interface UseUserProps {
	role?: string;
}

export const useUserDel = (id: string) => {

	const queryClient = useQueryClient()

	const { mutate, status } = useMutation({
		mutationFn: UserService.delete,
		onSuccess: (data) => {
			console.log("User deleted", data)
			queryClient.invalidateQueries({ queryKey: ['users_list'] })
		},
		onError: (err) => {
			console.error('User creation failed:', err);
		},
	});

	const handleDelUser = () => {
		mutate(id)
	}

	return {
		handleDelUser,
		status
	}
}

export const useUser = ({ role }: UseUserProps = {}) => {

	const [ user, setUser ] = useState<userPayload>({
		username: '',
		email: '',
		type_utilisateur: null,
		organisation: []
	})

	const { mutate : createUser, status : createStatus } = useMutation({
		mutationFn: UserService.create,
		onSuccess: (data) => {
			console.log("User created", data)
		},
		onError: (err) => {
			console.error('User creation failed:', err);
		},
	});

	const getUserQuery = useQuery({
		queryKey: ['users_list', role ?? 'all'],
		queryFn: () => UserService.list(role ? { role } : undefined),
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
		createUser(user)
	}

	return {
		handleCreateUser,
		getUserQuery,
		typeUserQuery,
		organisationQuery,
		createStatus,
		user,
		setUser,
	}
}