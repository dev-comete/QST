import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GENERAL_CACHE_TIME, GENERAL_STALE_TIME } from "../../types/constant"
import { FormationService } from "../../services/formationService"
import { useEffect, useState } from "react"
import type { FormationPayload } from "../../types/formationType"


export const useDelFormation = (id: string) => {
	const queryClient = useQueryClient()

	const deleteMutation = useMutation({
		mutationFn: FormationService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['formation_list'] })
		},
		onError: (err) => {
			console.error('Formation deletion failed:', err);
		},
	});

	const handleDelFormation = async () => {
		return await deleteMutation.mutateAsync(id)
	}

	return {
		handleDelFormation,
		isPending: deleteMutation.isPending
	}
}

export const useCreateFormation = () => {

	const [ formationInput, setFormationInput ] = useState('')

	const queryClient = useQueryClient()

	const { mutate, status : createFormationStatus } = useMutation({
		mutationFn: FormationService.create,
		onSuccess: (data) => {
			console.log("Formation created", data)
			setFormationInput('')
			queryClient.invalidateQueries({
                queryKey: ['formation_list'],
            });
			
		},
		onError: (err) => {
			console.error('Formation creation failed:', err);
		},
	});

	const handleCreateFormation = () => {
		const payload = {
			nom_formation: formationInput.trim()
		}
		mutate(payload)
	}

	return {
		formationInput, setFormationInput,
		handleCreateFormation,
		createFormationStatus
	}
}

export const useFormation = (id ?: string) => {

	const infoFormationQuery = useQuery({
		queryKey: ['formation_info', id],
		queryFn: () => FormationService.info(id ? id : ''),
		enabled: !!id
	})

	const formationQuery = useQuery({
		queryKey: ['formation_list'],
		queryFn: FormationService.list,
		staleTime: GENERAL_STALE_TIME,
		gcTime: GENERAL_CACHE_TIME
	})


	return {
		formations : formationQuery.data,
		formationsStatus : formationQuery.status,
		infoFormationQuery
	}
}

export const useEditFormation = (id: string) => {

	const queryClient = useQueryClient()
	const { infoFormationQuery } = useFormation(id)
	const [ formation, setFormation ] = useState<FormationPayload>({
		nom_formation: '',
	})

	useEffect(() => {
		if (!infoFormationQuery.data) return
		setFormation(infoFormationQuery.data)
	}, [infoFormationQuery.data])


	const updateFormation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: FormationPayload }) => FormationService.update(id, data),
		onSuccess: () => {
		queryClient.invalidateQueries({
			queryKey: ['formation_list'],
		});
		},
		onError: (err) => {
			console.error('Formation update failed:', err);
		},
	});

	const handleEditFormation = async () => {
		return await updateFormation.mutateAsync({id, data: formation})
	}

	return {
		handleEditFormation,
		isPending: updateFormation.isPending,
		isError: updateFormation.isError,
		formation,
		setFormation,
	}
}