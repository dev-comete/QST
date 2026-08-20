import { useQuery } from "@tanstack/react-query"
import { GENERAL_CACHE_TIME, GENERAL_STALE_TIME } from "../../types/constant"
import { FormationService } from "../../services/formationService"

export const useFormation = () => {

	const formationListQuery = useQuery({
		queryKey: ['formation_list'],
		queryFn: FormationService.list,
		staleTime: GENERAL_STALE_TIME,
		gcTime: GENERAL_CACHE_TIME
	})

	return {
		formationListQuery
	}
}