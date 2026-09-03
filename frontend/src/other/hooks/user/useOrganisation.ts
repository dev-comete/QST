import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { UserService } from "../../services/userService"
import { useState } from "react"
import { OrganisationService } from "../../services/organisationService";
import type { OrganisationPayload } from "../../types/userType";

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

export const useOrganisation = () => {

	const [ organisation, setOrganisation ] = useState<OrganisationPayload>({
		nom: '',
		is_active: true
	})

	const queryClient = useQueryClient()

	const { mutate, status } = useMutation({
		mutationFn: OrganisationService.create,
		onSuccess: (data) => {
			console.log("Organisation created", data)

			queryClient.invalidateQueries({
                queryKey: ['organisation_list'],
            });
		},
		onError: (err) => {
			console.error('Organisation creation failed:', err);
		},
	});

	const organisationQuery = useQuery({
		queryKey: ['organisation_list'],
		queryFn: OrganisationService.list
	})

	const handleCreateOrganisation = () => {
		mutate(organisation)
	}

	return {
		handleCreateOrganisation,
		organisationQuery,
		status,
		organisation,
		setOrganisation,
	}
}