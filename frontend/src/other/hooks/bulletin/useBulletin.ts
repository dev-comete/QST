import { useQuery } from "@tanstack/react-query"
import { BulletinService } from "../../services/bulletinService"

export const useBulletin = (vagueId?: string) => {

	const { data : bulletinList, status : bulletinListStatus } = useQuery({
		queryKey: ['bulletin_list'],
		queryFn: () => BulletinService.list()
	})

	const { data : myBulletin, status : myBulletinStatus } = useQuery({
		queryKey: ['my_bulletin', vagueId],
		queryFn: () => BulletinService.evalList(vagueId ?? ''),
		enabled: !!vagueId
	})

	return {
		bulletinList,
		bulletinListStatus,
		myBulletin,
		myBulletinStatus
	}
}