import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VagueService } from "../../services/vagueService";

export const useAssignVague = (vagueId: number) => {
	
	const [ students, setStudents] = useState<number[]>([])
	const [ quiz, setQuiz ] = useState<number | null>(null)

	const queryClient = useQueryClient()

	const assignStudent = useMutation({
		mutationFn: VagueService.assignStudent,
		onSuccess: () => {
			queryClient.invalidateQueries({
                queryKey: ['vague_list'],
            });
			setStudents([])
		},
		onError: (err) => {
			console.error('Student assignation error:', err);
		},
	});

	const handleAssignStudent = async () => {

		const payload = {
			vague_id: Number(vagueId),
			etudiant_ids: students
		}
		return await assignStudent.mutateAsync(payload)
	}

	const assignQuiz = useMutation({
		mutationFn: VagueService.assignQuiz,
		onSuccess: () => {
			queryClient.invalidateQueries({
                queryKey: ['vague_list'],
            });
			setQuiz(null)
		},
		onError: (err) => {
			console.error('Quiz assignation error:', err);
		},
	});

	const handleAssignQuiz = async () => {

		if (!quiz) return
	
		const payload = {
			vague_id: Number(vagueId),
			quiz_id: quiz
		}

		return await assignQuiz.mutateAsync(payload)
	}
	
	return {
		students,
		setStudents,
		isAssignStudPending: assignStudent.isPending,
		isAssignQuizPending: assignQuiz.isPending,
		quiz,
		setQuiz,
		handleAssignStudent,
		handleAssignQuiz
	}
}