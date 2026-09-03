import { useEffect, useState } from "react"
import type { vaguePayload } from "../../types/vagueType"
import { useMutation, useQuery } from "@tanstack/react-query";
import { VagueService } from "../../services/vagueService";
import { useFormation } from "../formation/useFormation";

export const useVague = () => {

	const [ vague, setVague ] = useState<vaguePayload>({
		formation_id: '1',
		debut: null,
		fin: null
	})

	const { formations } = useFormation()

	const getAllVague = useQuery({
		queryKey: ['vague_list'],
		queryFn: VagueService.getAllVague,
	})

	const { mutate, status : createStatus } = useMutation({
		mutationFn: VagueService.create,
		onSuccess: (data) => {
			console.log("Vague created", data)
		},
		onError: (err) => {
			console.error('Vague creation failed:', err);
		},
	});

	const handleCreateVague = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		//Validation données

		const payload = {
			...vague,
			debut: vague.debut ,
			fin: vague.fin ,
		}
		mutate(payload)
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
		createStatus,
		getAllVague
	}
}