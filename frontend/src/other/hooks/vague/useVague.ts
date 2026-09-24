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

type UseVagueParam = {
	id?: string
	formation?: string
	month?: string
	year?: string
}

export const useVague = ({ id, formation, month, year } : UseVagueParam) => {
	const getAllVague = useQuery({
		queryKey: ['vague_list', formation, month, year],
		queryFn: () => VagueService.list({formation, month, year}),
	})

	const infoVagueQuery = useQuery({
		queryKey: ['vague_info', id],
		queryFn: () => VagueService.info(id ? id : ''),
		enabled: !!id
	})

	return {
		getAllVague,
		infoVagueQuery
	}
}

export const useVagueCreate = () => {

	const [ vague, setVague ] = useState<vaguePayload>({
		nom_vague: '',
		formation_id: 1,
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
				formation_id: formations.length === 0 ? 1 : formations[0].id,
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

export const useVagueEdit = (id: string) => {

	const [ vague, setVague ] = useState<vaguePayload>({
		nom_vague: '',
		formation_id: 1,
		debut: null,
		fin: null
	})
	const { formations } = useFormation()
	const queryClient = useQueryClient()
	const { infoVagueQuery } = useVague({ id })

	const editVague = useMutation({
		mutationFn: ({ id, data }: { id: number; data: vaguePayload }) => VagueService.edit(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
                queryKey: ['vague_list'],
            });
		},
		onError: (err) => {
			console.error('Vague creation failed:', err);
		},
	});

	const handleVagueEdit = async () => {
		const payload = {
			...vague,
			debut: vague.debut ,
			fin: vague.fin ,
			nom_vague: vague.nom_vague
		}

		return await editVague.mutateAsync({id: Number(id), data: payload})
	}

	useEffect(() => {

		const initVague = async () => {
			
			if (!formations || !infoVagueQuery.data) return

			const initVague = infoVagueQuery.data

			setVague({
				nom_vague: initVague.nom_vague,
				formation_id: initVague.formation,
				debut: initVague.debut,
				fin: initVague.fin
			});
		}

		initVague()

	}, [formations, infoVagueQuery.data]);

	return {
		vague,
		setVague,
		handleVagueEdit,
		isPending: editVague.isPending,
	}
}


export const useVagueStat = (id: string) => {
	const { data, isPending } = useQuery({
		queryKey: ['vague_stat', id],
		queryFn: () => VagueService.statistic(id),
	})

	return {
		data,
		isPending
	}
}