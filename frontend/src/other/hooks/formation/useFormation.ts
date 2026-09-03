import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GENERAL_CACHE_TIME, GENERAL_STALE_TIME } from "../../types/constant"
import { FormationService } from "../../services/formationService"
import { useState } from "react"

export const useFormation = () => {

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

	const { data: formations, status: formationsStatus } = useQuery({
		queryKey: ['formation_list'],
		queryFn: FormationService.list,
		staleTime: GENERAL_STALE_TIME,
		gcTime: GENERAL_CACHE_TIME
	})


	return {
		formations, formationsStatus,
		formationInput, setFormationInput,
		handleCreateFormation,
		createFormationStatus
	}
}