import { useEffect, useState } from "react"
import type { vaguePayload } from "../../types/vagueType"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VagueService } from "../../services/vagueService";
import { useFormation } from "../formation/useFormation";

export const useVagueDel = (id: number) => {
	const queryClient = useQueryClient()

	const deleteMutation = useMutation({
		mutationFn: VagueService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['quiz_list'] })
		},
		onError: (err) => {
			console.error('Quiz deletion failed:', err);
		},
	});

	const handleDelVague = async () => {
		return await deleteMutation.mutateAsync(id)
	}

	return {
		handleDelVague,
		isPending: deleteMutation.isPending
	}
}

export const useVague = () => {
	const getAllVague = useQuery({
		queryKey: ['vague_list'],
		queryFn: VagueService.getAllVague,
	})

	return {
		getAllVague,
	}
}

export const useVagueCreate = () => {

	const [ vague, setVague ] = useState<vaguePayload>({
		formation_id: '1',
		debut: null,
		fin: null
	})

	const { formations } = useFormation()

	const queryClient = useQueryClient()

	const createVague = useMutation({
		mutationFn: VagueService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({
                queryKey: ['vague_list'],
            });
		},
		onError: (err) => {
			console.error('Vague creation failed:', err);
		},
	});

	const handleCreateVague = async () => {
		//Validation données

		const payload = {
			...vague,
			debut: vague.debut ,
			fin: vague.fin ,
		}

		return await createVague.mutateAsync(payload)
	}

	useEffect(() => {

		const initQuestion = async () => {

			if (!formations) return

			setVague((prev) => ({
				...prev,
				formation_id: String(formations[0].id),
			}));
		}

		initQuestion()

	}, [formations]);

	return {
		vague,
		setVague,
		handleCreateVague,
		isPending: createVague.isPending,
	}
}