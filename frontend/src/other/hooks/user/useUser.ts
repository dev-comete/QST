import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserService } from "../../services/userService"
import { useEffect, useState } from "react"
import type { userPayload } from "../../types/userType"

export interface UseUserProps {
	role?: string;
}

export const useCreateUser = () => {
	const [ user, setUser ] = useState<userPayload>({
		username: '',
		email: '',
		type_utilisateur: null,
		organisation: []
	})

	const [ userError, setUserError ] = useState<string | null>(null)
	const [ emailError, setEmailError ] = useState<string | null>(null)


	const resetError = () => {
		setUserError(null);
		setEmailError(null);
	}

	const queryClient = useQueryClient()

	const createUser = useMutation({
		mutationFn: UserService.create,
		onMutate: () => resetError(),
		onSuccess: () => {
			queryClient.invalidateQueries({
                queryKey: ['users_list'],
            });
		},
		onError: (err) => {
			if (err.cause == 'user')
				setUserError(err.message)
			else
				setEmailError(err.message)
		},
	});

	const typeUserQuery = useQuery({
		queryKey: ['utilisateur_type_list'],
		queryFn: UserService.type
	})

	const handleCreateUser = async () => {
		resetError()
		return await createUser.mutateAsync(user)
	}

	return {
		handleCreateUser,
		typeUserQuery,
		isPending: createUser.isPending,
		user,
		setUser,
		userError,
		setUserError,
		emailError,
		setEmailError,
		resetError
	}
}

export interface UseUserProps {
	role?: string
	id?: string
}

export const useUser = ({ role, id } : UseUserProps) => {

	const getUserQuery = useQuery({
		queryKey: ['users_list', role ?? 'all'],
		queryFn: () => UserService.list(role ? { role } : undefined),
	});

	const userInfoQuery = useQuery({
		queryKey: ['user_info', id],
		queryFn: () => UserService.info({ id: id ?? ''}),
		enabled: !!id
	})

	return {
		getUserQuery,
		userInfoQuery
	}
}

export const useUserDel = (id: string) => {

	const queryClient = useQueryClient()

	const deleteMutation = useMutation({
		mutationFn: UserService.delete,
		onSuccess: (data) => {
			console.log("User deleted", data)
			queryClient.invalidateQueries({ queryKey: ['users_list'] })
		},
		onError: (err) => {
			console.error('User creation failed:', err);
		},
	});

	const handleDelUser = async () => {
		return await deleteMutation.mutateAsync(id)
	}

	return {
		handleDelUser,
		isPending: deleteMutation.isPending
	}
}

export const useUserUpdate = (id: string) => {

	const { userInfoQuery } = useUser({ id })

	const [ user, setUser ] = useState<userPayload>({
		username: '',
		email: '',
		type_utilisateur: null,
		organisation: []
	})
	const [ userError, setUserError ] = useState<string | null>(null)
	const [ emailError, setEmailError ] = useState<string | null>(null)

	const resetError = () => {
		setUserError(null);
		setEmailError(null);
	}

	useEffect(() => {
		if (!userInfoQuery.data) return
		setUser(userInfoQuery.data)
	}, [userInfoQuery.data])

	const queryClient = useQueryClient()

	const updateUser = useMutation({
		mutationFn: ({ id, data }: { id: string; data: userPayload }) =>
			UserService.update(id, data),
		onMutate: () => resetError(),
		onSuccess: () => {
			queryClient.invalidateQueries({
                queryKey: ['users_list'],
            });
		},
		onError: (err) => {
			if (err.cause == 'user')
				setUserError(err.message)
			else
				setEmailError(err.message)
		},
	});

	const typeUserQuery = useQuery({
		queryKey: ['utilisateur_type_list'],
		queryFn: UserService.type
	})

	const handleUpdateUser = async () => {
		resetError()
		return await updateUser.mutateAsync({id, data: user})
	}

	return {
		handleUpdateUser,
		typeUserQuery,
		isPending: updateUser.isPending,
		user,
		setUser,
		userError,
		setUserError,
		emailError,
		setEmailError,
		resetError
	}
}