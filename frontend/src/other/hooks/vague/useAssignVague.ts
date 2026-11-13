import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';
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

export const useRemoveFromVague = (vagueId: number) => {
    const queryClient = useQueryClient();

    const removeStudent = useMutation({
        mutationFn: (etudiantId: number) => VagueService.removeStudent({ vague_id: vagueId, etudiant_ids: [etudiantId] }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['vague_list'] });
            queryClient.invalidateQueries({ queryKey: ['vague_info', String(vagueId)] });
            toast.success(data?.message || "Étudiant retiré avec succès.");
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error || err.response?.data?.errors?.[0] || "Impossible de retirer cet étudiant.";
            toast.error(errorMsg);
        }
    });

    const removeQuiz = useMutation({
        mutationFn: (quizId: number) => VagueService.removeQuiz({ vague_id: vagueId, quiz_id: quizId }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['vague_list'] });
            queryClient.invalidateQueries({ queryKey: ['vague_info', String(vagueId)] });
            toast.success(data?.message || "Quiz retiré de la vague avec succès.");
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error || "Impossible de retirer ce quiz car il a déjà été commencé.";
            toast.error(errorMsg);
        }
    });

    return {
        handleRemoveStudent: async (id: number) => await removeStudent.mutateAsync(id),
        isRemovingStudent: removeStudent.isPending,
        handleRemoveQuiz: async (id: number) => await removeQuiz.mutateAsync(id),
        isRemovingQuiz: removeQuiz.isPending,
    };
};