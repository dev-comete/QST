import axios from "axios";
import { buildValidationCriteria } from "../hooks/question/useQuestionCreate";
import type {
	importDraftType,
	importedQuestionType,
	importWarning,
	questionType,
	respType,
} from "../types/questionType";

// Mirror of the backend limits (QUESTION_IMPORT_* settings): cheap early feedback, the backend stays the authority.
export const IMPORT_ACCEPT = ".pdf,.docx,.xlsx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp";
export const IMPORT_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const IMPORT_MAX_TEXT_CHARS = 60000;
export const IMPORT_MIN_TEXT_CHARS = 10;

type TypeCode = 'OUV' | 'QCU' | 'QCM';

let uidSeed = 0;
export const nextUid = () => `imp_${Date.now()}_${uidSeed++}`;

// Same rule as the backend normalizer: it is recomputed here so the type follows the teacher's edits.
export const inferTypeCode = (options: respType[]): TypeCode => {
	if (options.length === 0) return 'OUV';
	return options.filter((o) => o.est_correct).length > 1 ? 'QCM' : 'QCU';
};

// Soft hints (amber badges). Backend warnings are NOT reused: they go stale as soon as the teacher edits.
export const computeWarnings = (
	options: respType[],
	typeCode: string,
	typeIds: Record<string, number>
): importWarning[] => {
	const warnings: importWarning[] = [];

	if (options.length > 0) {
		const correct = options.filter((o) => o.est_correct).length;
		if (correct === 0) warnings.push('no_correct_answer');
		if (options.length === 1) warnings.push('too_few_options');
		if (options.length >= 2 && correct === options.length) warnings.push('all_options_correct');
	}

	const typesLoaded = Object.keys(typeIds).length > 0;
	if (typesLoaded && typeIds[typeCode] === undefined) warnings.push('unknown_type');

	return warnings;
};

// Hard rules (red): the question cannot be saved until these are fixed or the question is unticked.
export const getBlockingIssues = (draft: importDraftType, typeIds: Record<string, number>): string[] => {
	const issues: string[] = [];
	const typeCode = inferTypeCode(draft.options);

	if (draft.enonce_question.trim().length === 0) {
		issues.push("L'énoncé est vide.");
	}

	if (typeIds[typeCode] === undefined) {
		issues.push(`Le type ${typeCode} n'existe pas dans votre banque de types.`);
	}

	if (typeCode !== 'OUV') {
		if (draft.options.some((o) => o.reponse.trim().length === 0)) {
			issues.push("Une des réponses est vide.");
		}
		const criteria = buildValidationCriteria(draft.options, typeCode);
		if (!criteria.trueCondition) issues.push(`${criteria.msg} ${criteria.correctMsg}.`);
		if (!criteria.falseCondition) issues.push(`${criteria.msg} ${criteria.falseMsg}.`);
	}

	return issues;
};

export const toDraft = (q: importedQuestionType): importDraftType => ({
	uid: nextUid(),
	selected: true,
	enonce_question: q.enonce_question,
	bareme_pts: q.bareme_pts,
	options: q.options.map((o) => ({
		reponse: o.reponse,
		est_correct: o.est_correct,
		explication: o.explication ?? '',
	})),
});

// Exactly the shape QuestionService.create already expects.
export const toQuestionPayload = (draft: importDraftType, typeId: number): questionType => ({
	enonce_question: draft.enonce_question.trim(),
	type_id: typeId,
	bareme_pts: draft.bareme_pts,
	options:
		inferTypeCode(draft.options) === 'OUV'
			? []
			: draft.options.map((o) => ({
					reponse: o.reponse.trim(),
					est_correct: o.est_correct,
					explication: (o.explication ?? '').trim(),
				})),
});

// Backend errors come as {error, code} (import errors) or DRF shapes ({fichier: [...]}, {non_field_errors: [...]}, {detail}).
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
	if (!axios.isAxiosError(err)) return fallback;

	if (err.response?.status === 429) {
		return "Trop de demandes d'import. Réessayez dans un moment.";
	}

	const data = err.response?.data as Record<string, unknown> | undefined;
	if (data && typeof data === 'object') {
		if (typeof data.error === 'string') return data.error;
		if (typeof data.detail === 'string') return data.detail;
		const first = Object.values(data)[0];
		if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
		if (typeof first === 'string') return first;
	}
	return fallback;
};
