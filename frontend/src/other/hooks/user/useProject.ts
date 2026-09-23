import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import type { ProjectPayload } from "../../types/userType";
import { ProjectService } from "../../services/projectService";

export interface UseUserProps {
	role?: string;
}

export const useProjectDel = (id: number) => {

	const queryClient = useQueryClient()

	const deleteMutation = useMutation({
		mutationFn: ProjectService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['project_list'] })
		},
		onError: (err) => {
			console.error('Organisation creation failed:', err);
		},
	});

	const handleDelProject = async () => {
		return await deleteMutation.mutateAsync(id)
	}

	return {
		handleDelProject,
		isPending: deleteMutation.isPending
	}
}

export const useProject = (id?: string) => {

	const infoProjectQuery = useQuery({
		queryKey: ['project_info', id],
		queryFn: () => ProjectService.info(id ? id : ''),
		enabled: !!id
	})

	const projectQuery = useQuery({
		queryKey: ['project_list'],
		queryFn: ProjectService.list,
	})

	return {
		projectQuery,
		infoProjectQuery
	}
}

export const useCreateProject = () => {

	const [ project, setProject ] = useState<ProjectPayload>({
		nom: '',
		is_active: true
	})

	const queryClient = useQueryClient()

	const { mutate, isPending } = useMutation({
		mutationFn: ProjectService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({
                queryKey: ['project_list'],
            });
		},
		onError: (err) => {
			console.error('Project creation failed:', err);
		},
	});

	const handleCreateProject = () => {
		mutate(project)
	}

	return {
		handleCreateProject,
		isPending,
		project,
		setProject,
	}
}

export const useEditProject = (id: string) => {

	const queryClient = useQueryClient()
	const { infoProjectQuery } = useProject(id)
	const [ project, setProject ] = useState<ProjectPayload>({
		nom: '',
		is_active: true
	})

	useEffect(() => {
		if (!infoProjectQuery.data) return
		setProject(infoProjectQuery.data)
	}, [infoProjectQuery.data])


	const updateProject = useMutation({
		mutationFn: ({ id, data }: { id: string; data: ProjectPayload }) => ProjectService.update(id, data),
		onSuccess: () => {
		queryClient.invalidateQueries({
			queryKey: ['project_list'],
		});
		},
		onError: (err) => {
			console.error('Project edit failed:', err);
		},
	});

	const handleEditProject = async () => {
		return await updateProject.mutateAsync({id, data: project})
	}

	return {
		handleEditProject,
		isPending: updateProject.isPending,
		isError: updateProject.isError,
		project,
		setProject,
	}
}