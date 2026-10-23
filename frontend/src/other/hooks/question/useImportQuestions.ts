import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService";
import type { importDraftType } from "../../types/questionType";
import {
	computeWarnings,
	getApiErrorMessage,
	getBlockingIssues,
	IMPORT_MAX_FILE_BYTES,
	IMPORT_MIN_TEXT_CHARS,
	inferTypeCode,
	toDraft,
	toQuestionPayload,
} from "../../helper/importHelper";
import { useQuestionType } from "./useQuestionType";

export type ImportStep = 'input' | 'preview' | 'done';

type SaveItem = { draft: importDraftType; typeId: number };

export const useImportQuestions = () => {

	const queryClient = useQueryClient()
	const { questionTypeQuery } = useQuestionType()

	const [ step, setStep ] = useState<ImportStep>('input')
	const [ file, setFileState ] = useState<File | null>(null)
	const [ text, setTextState ] = useState('')
	const [ drafts, setDrafts ] = useState<importDraftType[]>([])
	const [ skipped, setSkipped ] = useState(0)
	const [ savedCount, setSavedCount ] = useState(0)
	const [ errorMsg, setErrorMsg ] = useState<string | null>(null)

	// { QCU: 1, QCM: 2, OUV: 3 }, built from the question types the app already loads
	const typeIds = useMemo(() => {
		const map: Record<string, number> = {}
		for (const t of questionTypeQuery.data ?? []) {
			if (t.code) map[t.code.toUpperCase()] = t.id
		}
		return map
	}, [questionTypeQuery.data])

	// ---- Step 1: analyse (preview only, nothing is saved) ----
	const analyzeMutation = useMutation({
		mutationFn: QuestionService.importFromDocument,
		onSuccess: (data) => {
			if (data.questions.length === 0) {
				setErrorMsg("Aucune question n'a été trouvée dans ce document.")
				return
			}
			setDrafts(data.questions.map(toDraft))
			setSkipped(data.skipped)
			setSavedCount(0)
			setErrorMsg(null)
			setStep('preview')
		},
		onError: (err) => {
			setErrorMsg(getApiErrorMessage(err, "L'analyse du document a échoué."))
		},
	})

	// ---- Step 2: save the reviewed questions with the existing create endpoint ----
	// One by one: a failure never loses the others, and failed ones stay in the preview for a retry.
	const saveMutation = useMutation({
		mutationFn: async (items: SaveItem[]) => {
			const saved: string[] = []
			const errors: Record<string, string> = {}
			for (const { draft, typeId } of items) {
				try {
					await QuestionService.create(toQuestionPayload(draft, typeId))
					saved.push(draft.uid)
				} catch (err) {
					errors[draft.uid] = getApiErrorMessage(err, "L'enregistrement a échoué.")
				}
			}
			return { saved, errors }
		},
		onSuccess: ({ saved, errors }) => {
			// The list query key is not known here: refresh every query whose key mentions "question".
			queryClient.invalidateQueries({
				predicate: (query) => String(query.queryKey[0]).includes('question'),
			})
			setSavedCount((prev) => prev + saved.length)
			setDrafts((prev) =>
				prev
					.filter((d) => !saved.includes(d.uid))
					.map((d) => ({ ...d, saveError: errors[d.uid] }))
			)
			if (Object.keys(errors).length === 0) setStep('done')
		},
	})

	// ---- Input handlers (file and text are mutually exclusive, like the backend expects) ----
	const setFile = (selected: File | null) => {
		if (selected && selected.size > IMPORT_MAX_FILE_BYTES) {
			setErrorMsg(`Fichier trop volumineux (max ${IMPORT_MAX_FILE_BYTES / (1024 * 1024)} Mo).`)
			return
		}
		setFileState(selected)
		if (selected) setTextState('')
		setErrorMsg(null)
	}

	const setText = (value: string) => {
		setTextState(value)
		if (value) setFileState(null)
		setErrorMsg(null)
	}

	const canAnalyze =
		!analyzeMutation.isPending &&
		!!questionTypeQuery.data &&
		(file !== null || text.trim().length >= IMPORT_MIN_TEXT_CHARS)

	const handleAnalyze = () => {
		if (!canAnalyze) return
		analyzeMutation.mutate(file ? { fichier: file } : { texte: text.trim() })
	}

	// ---- Preview derived state ----
	const selectedDrafts = drafts.filter((d) => d.selected)

	const needsReviewCount = drafts.filter((d) => {
		const code = inferTypeCode(d.options)
		return computeWarnings(d.options, code, typeIds).length > 0
			|| getBlockingIssues(d, typeIds).length > 0
	}).length

	const hasBlockingIssues = selectedDrafts.some((d) => getBlockingIssues(d, typeIds).length > 0)

	const canSave = selectedDrafts.length > 0 && !hasBlockingIssues && !saveMutation.isPending

	const handleSave = async () => {
		if (!canSave) return
		const items = selectedDrafts.map((draft) => ({
			draft,
			typeId: typeIds[inferTypeCode(draft.options)],
		}))
		await saveMutation.mutateAsync(items)
	}

	const backToInput = () => {
		setStep('input')
		setErrorMsg(null)
	}

	const reset = () => {
		analyzeMutation.reset()
		saveMutation.reset()
		setStep('input')
		setFileState(null)
		setTextState('')
		setDrafts([])
		setSkipped(0)
		setSavedCount(0)
		setErrorMsg(null)
	}

	return {
		step,
		file, setFile,
		text, setText,
		errorMsg,
		canAnalyze,
		handleAnalyze,
		isAnalyzing: analyzeMutation.isPending,
		drafts, setDrafts,
		typeIds,
		skipped,
		savedCount,
		selectedCount: selectedDrafts.length,
		needsReviewCount,
		canSave,
		handleSave,
		isSaving: saveMutation.isPending,
		backToInput,
		reset,
		isTypesReady: !!questionTypeQuery.data,
	}
}
