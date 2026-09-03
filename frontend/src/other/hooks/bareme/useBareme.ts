import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { BaremeService } from "../../services/baremeService"
import { GENERAL_CACHE_TIME, GENERAL_STALE_TIME } from "../../types/constant"

export const useDelBareme = (id: number) => {

	const queryClient = useQueryClient()

	const { mutate, status } = useMutation({
		mutationFn: BaremeService.delete,
		onSuccess: (data) => {
			console.log("Bareme deleted", data)
			queryClient.invalidateQueries({ queryKey: ['bareme_list'] })
		},
		onError: (err) => {
			console.error('Bareme deletion failed:', err);
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

export const useBareme = () => {

	const [ baremeInput, setBaremeInput ] = useState<number | undefined>(undefined)
	const queryClient = useQueryClient()

	const { mutate, status : createBaremeStatus } = useMutation({
		mutationFn: BaremeService.create,
		onSuccess: (data) => {
			console.log("Bareme created", data)
			setBaremeInput(undefined)
			queryClient.invalidateQueries({
                queryKey: ['bareme_list'],
            });
			
		},
		onError: (err) => {
			console.error('Bareme creation failed:', err);
		},
	});

	const handleCreateBareme = () => {
		const payload = {
			pts: baremeInput ? baremeInput : 0
		}
		mutate(payload)
	}

	const baremeQuery = useQuery({
		queryKey: ['bareme_list'],
		queryFn: BaremeService.list,
		staleTime: GENERAL_STALE_TIME,
		gcTime: GENERAL_CACHE_TIME
	})

	return {
		baremeQuery,
		baremeInput, setBaremeInput,
		createBaremeStatus,
		handleCreateBareme
	}
}