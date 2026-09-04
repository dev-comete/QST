import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { OrganisationService } from "../../services/organisationService";
import type { OrganisationPayload } from "../../types/userType";

export interface UseUserProps {
	role?: string;
}

export const useOrgDel = (id: number) => {

	const queryClient = useQueryClient()

	const deleteMutation = useMutation({
		mutationFn: OrganisationService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['organisation_list'] })
		},
		onError: (err) => {
			console.error('Organisation creation failed:', err);
		},
	});

	const handleDelOrg = async () => {
		return await deleteMutation.mutateAsync(id)
	}

	return {
		handleDelOrg,
		isPending: deleteMutation.isPending
	}
}

export const useOrganistion = (id?: string) => {

	const infoOrgQuery = useQuery({
		queryKey: ['organisation_info', id],
		queryFn: () => OrganisationService.info(id ? id : ''),
		enabled: !!id
	})

	const organisationQuery = useQuery({
		queryKey: ['organisation_list'],
		queryFn: OrganisationService.list,
	})

	return {
		organisationQuery,
		infoOrgQuery
	}
}

export const useCreateOrganisation = () => {

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

	const handleCreateOrganisation = () => {
		mutate(organisation)
	}

	return {
		handleCreateOrganisation,
		status,
		organisation,
		setOrganisation,
	}
}

export const useEditOrganisation = (id: string) => {

	const queryClient = useQueryClient()
	const { infoOrgQuery } = useOrganistion(id)
	const [ organisation, setOrganisation ] = useState<OrganisationPayload>({
		nom: '',
		is_active: true
	})

	useEffect(() => {
		if (!infoOrgQuery.data) return
		setOrganisation(infoOrgQuery.data)
	}, [infoOrgQuery.data])


	const updateOrg = useMutation({
		mutationFn: ({ id, data }: { id: string; data: OrganisationPayload }) => OrganisationService.update(id, data),
		onSuccess: () => {
		queryClient.invalidateQueries({
			queryKey: ['organisation_list'],
		});
		},
		onError: (err) => {
			console.error('Organisation creation failed:', err);
		},
	});

	const handleEditOrganisation = async () => {
		return await updateOrg.mutateAsync({id, data: organisation})
	}

	return {
		handleEditOrganisation,
		isPending: updateOrg.isPending,
		isError: updateOrg.isError,
		organisation,
		setOrganisation,
	}
}