import type { Dispatch, SetStateAction } from "react";
import type { importDraftType, respType } from "../../../../other/types/questionType";
import { computeWarnings, getBlockingIssues, inferTypeCode } from "../../../../other/helper/importHelper";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import Input from "../../../atoms/Form/Input";
import TextArea from "../../../atoms/Form/TextArea";
import Info from "../../../atoms/Form/Info";
import CustomText from "../../../atoms/Text/CustomText";
import IconButton from "../../../molecules/Buttons/IconButton";
import StatusBadge from "../../../molecules/Badge/StatusBadge";
import WarningBadge from "../../../molecules/Badge/WarningBadge";

interface ImportQuestionCardProps {
	index: number
	draft: importDraftType
	typeIds: Record<string, number>
	disabled?: boolean
	onToggleSelected: (selected: boolean) => void
	onEnonceChange: (value: string) => void
	onOptionChange: (optionIndex: number, patch: Partial<respType>) => void
	onAddOption: () => void
	onRemoveOption: (optionIndex: number) => void
	onRemove: () => void
}

const ImportQuestionCard = ({
	index,
	draft,
	typeIds,
	disabled = false,
	onToggleSelected,
	onEnonceChange,
	onOptionChange,
	onAddOption,
	onRemoveOption,
	onRemove,
}: ImportQuestionCardProps) => {

	const typeCode = inferTypeCode(draft.options)
	const warnings = computeWarnings(draft.options, typeCode, typeIds)
	const issues = getBlockingIssues(draft, typeIds)
	const idBase = `import_${draft.uid}`

	const borderStyle = !draft.selected
		? 'border-background'
		: issues.length > 0 ? 'border-error' : 'border-background'

	return (
		<Paper className={`p-5 w-full border ${borderStyle} ${draft.selected ? '' : 'opacity-50'}`} hasShadow>
			<Box direction="column" className="w-full gap-3 items-start">

				<Box className="w-full justify-between items-center gap-2">
					<Box className="items-center gap-3">
						<Box>
							<Input
								id={`${idBase}_selected`}
								name={`${idBase}_selected`}
								type="checkbox"
								checked={draft.selected}
								disabled={disabled}
								onChange={(e) => onToggleSelected(e.target.checked)}
								title="Inclure cette question dans l'import"
							/>
						</Box>
						<CustomText textTag="h6" weight="bold">Question {index + 1}</CustomText>
						<StatusBadge value={typeCode} />
					</Box>
					<IconButton iconName="close" action={onRemove} disabled={disabled} />
				</Box>

				{warnings.length > 0 && (
					<Box className="gap-2 flex-wrap">
						{warnings.map((w) => <WarningBadge key={w} warning={w} />)}
					</Box>
				)}

				<TextArea
					id={`${idBase}_enonce`}
					name={`${idBase}_enonce`}
					label="Énoncé"
					row={2}
					minLength={0}
					value={draft.enonce_question}
					readonly={disabled}
					onChange={(e) => onEnonceChange(e.target.value)}
				/>

				{draft.options.map((option, i) => (
					<Box
						key={i}
						className={`border ${option.est_correct ? 'border-success bg-success-light' : 'border-background'} p-3 gap-2 w-full items-start rounded-xl relative`}
					>
						<Box>
							<Input
								id={`${idBase}_correct_${i}`}
								name={`${idBase}_correct_${i}`}
								type="checkbox"
								checked={option.est_correct}
								disabled={disabled}
								onChange={(e) => onOptionChange(i, { est_correct: e.target.checked })}
								title="Bonne réponse"
							/>
						</Box>
						<Box direction="column" className="w-full gap-2 pr-6">
							<TextArea
								id={`${idBase}_resp_${i}`}
								name={`${idBase}_resp_${i}`}
								label={`Réponse ${i + 1}`}
								row={1}
								minLength={0}
								value={option.reponse}
								readonly={disabled}
								onChange={(e) => onOptionChange(i, { reponse: e.target.value })}
							/>
							{option.est_correct && (
								<TextArea
									id={`${idBase}_expl_${i}`}
									name={`${idBase}_expl_${i}`}
									label="Explication (optionnelle)"
									row={1}
									minLength={0}
									value={option.explication ?? ''}
									readonly={disabled}
									onChange={(e) => onOptionChange(i, { explication: e.target.value })}
								/>
							)}
						</Box>
						<IconButton
							iconName="close"
							btnStyling="absolute right-1 top-1"
							action={() => onRemoveOption(i)}
							disabled={disabled}
						/>
					</Box>
				))}

				{!disabled && (
					<div
						className="border-2 border-primary border-dashed rounded-xl w-full p-3 text-center cursor-pointer hover:bg-background"
						onClick={onAddOption}
					>
						<CustomText weight="bold" color="primary">+ Ajouter une réponse</CustomText>
					</div>
				)}

				{draft.selected && issues.length > 0 && (
					<ul className="list-disc pl-5 text-error text-sm space-y-1">
						{issues.map((issue) => <li key={issue}>{issue}</li>)}
					</ul>
				)}

				{draft.saveError && <Info info={draft.saveError} variant="error" />}
			</Box>
		</Paper>
	)
}

interface ImportPreviewListProps {
	drafts: importDraftType[]
	setDrafts: Dispatch<SetStateAction<importDraftType[]>>
	typeIds: Record<string, number>
	disabled?: boolean
}

const ImportPreviewList = ({ drafts, setDrafts, typeIds, disabled = false }: ImportPreviewListProps) => {

	// Any edit clears the previous save error of that question.
	const updateDraft = (uid: string, patch: Partial<importDraftType>) => {
		setDrafts((prev) => prev.map((d) => (d.uid === uid ? { ...d, ...patch, saveError: undefined } : d)))
	}

	const updateOptions = (uid: string, change: (options: respType[]) => respType[]) => {
		setDrafts((prev) =>
			prev.map((d) => (d.uid === uid ? { ...d, options: change(d.options), saveError: undefined } : d))
		)
	}

	if (drafts.length === 0) {
		return <CustomText color="disabled">Aucune question à importer.</CustomText>
	}

	return (
		<Box direction="column" className="w-full gap-4">
			{drafts.map((draft, index) => (
				<ImportQuestionCard
					key={draft.uid}
					index={index}
					draft={draft}
					typeIds={typeIds}
					disabled={disabled}
					onToggleSelected={(selected) => updateDraft(draft.uid, { selected })}
					onEnonceChange={(value) => updateDraft(draft.uid, { enonce_question: value })}
					onOptionChange={(optionIndex, patch) =>
						updateOptions(draft.uid, (options) =>
							options.map((o, i) => (i === optionIndex ? { ...o, ...patch } : o))
						)
					}
					onAddOption={() =>
						updateOptions(draft.uid, (options) => [
							...options,
							{ reponse: '', est_correct: false, explication: '' },
						])
					}
					onRemoveOption={(optionIndex) =>
						updateOptions(draft.uid, (options) => options.filter((_, i) => i !== optionIndex))
					}
					onRemove={() => setDrafts((prev) => prev.filter((d) => d.uid !== draft.uid))}
				/>
			))}
		</Box>
	)
}

export default ImportPreviewList;
