import { useState } from "react"
import { useParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { VagueService } from "../../services/vagueService";

export const useAssignVague = () => {
	
	const [ students, setStudents] = useState<number[]>([])
	const [ quiz, setQuiz ] = useState<number | null>(null)
	
	const { id : vagueId } = useParams();

	const { mutate : studentAssignation, status : studentStatus } = useMutation({
		mutationFn: VagueService.assignStudent,
		onSuccess: (data) => {
			console.log("Student assignated", data)
		},
		onError: (err) => {
			console.error('Student assignation error:', err);
		},
	});

	const handleAssignStudent = () => {

		if (!vagueId) return
	
		const payload = {
			vague_id: Number(vagueId),
			etudiant_ids: students
		}

		studentAssignation(payload)
	}

	const { mutate : quizAssignation, status : quizStatus } = useMutation({
		mutationFn: VagueService.assignQuiz,
		onSuccess: (data) => {
			console.log("Quiz assignated", data)
		},
		onError: (err) => {
			console.error('Quiz assignation error:', err);
		},
	});

	const handleAssignQuiz = () => {

		if (!quiz) return
	
		const payload = {
			vague_id: Number(vagueId),
			quiz_id: quiz
		}

		quizAssignation(payload)
	}
	
	return {
		students,
		setStudents,
		studentStatus,
		quiz,
		setQuiz,
		quizStatus,
		handleAssignStudent,
		handleAssignQuiz
	}
}