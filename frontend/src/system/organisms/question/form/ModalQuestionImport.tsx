import { useImportQuestions } from "../../../../other/hooks/question/useImportQuestions";
import { IMPORT_ACCEPT, IMPORT_MAX_TEXT_CHARS } from "../../../../other/helper/importHelper";
import Box from "../../../atoms/Container/Box";
import FileInput from "../../../atoms/Form/FileInput";
import Info from "../../../atoms/Form/Info";
import TextArea from "../../../atoms/Form/TextArea";
import FAIcon from "../../../atoms/Icon/FAIcon";
import CustomText from "../../../atoms/Text/CustomText";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import ImportPreviewList from "../list/ImportPreviewList";

type ImportState = ReturnType<typeof useImportQuestions>

// ---- Step 1: choose a file or paste text ----
const ImportSourceStep = ({ imp }: { imp: ImportState }) => (
	<Box direction="column" className="w-full gap-5">
		<FileInput
			id="import_file"
			name="import_file"
			label="Fichier de questions"
			accept={IMPORT_ACCEPT}
			file={imp.file}
			onChange={imp.setFile}
			disabled={imp.isAnalyzing}
			helper="PDF, Word, Excel, TXT ou image (5 Mo max)"
		/>

		<CustomText color="disabled" className="self-center">— ou —</CustomText>

		<TextArea
			id="import_text"
			name="import_text"
			label="Collez votre texte"
			row={6}
			minLength={0}
			maxLength={IMPORT_MAX_TEXT_CHARS}
			value={imp.text}
			readonly={imp.isAnalyzing}
			placeholder={"1- Capitale de la France ?\nA) Berlin\nB) Paris *\nC) Rome"}
			onChange={(e) => imp.setText(e.target.value)}
		/>

		{imp.errorMsg && <Info info={imp.errorMsg} variant="error" />}

		{imp.isAnalyzing && (
			<CustomText textTag="p" color="disabled" className="text-sm">
				Analyse en cours, cela peut prendre jusqu'à 30 secondes…
			</CustomText>
		)}
	</Box>
)

// ---- Step 2: review and fix before saving ----
const ImportPreviewStep = ({ imp }: { imp: ImportState }) => (
	<Box direction="column" className="w-full gap-4">
		<Box direction="column" className="gap-1">
			<CustomText weight="bold">
				{imp.drafts.length} question{imp.drafts.length > 1 ? 's' : ''} détectée{imp.drafts.length > 1 ? 's' : ''}
				{imp.needsReviewCount > 0 && ` · ${imp.needsReviewCount} à vérifier`}
			</CustomText>
			<CustomText textTag="p" color="disabled" className="text-sm">
				Corrigez si besoin, cochez la bonne réponse, puis importez. Décochez une question pour l'ignorer.
				{imp.skipped > 0 && ` (${imp.skipped} élément${imp.skipped > 1 ? 's' : ''} vide${imp.skipped > 1 ? 's' : ''} ignoré${imp.skipped > 1 ? 's' : ''})`}
			</CustomText>
			{imp.savedCount > 0 && (
				<CustomText textTag="p" color="success" className="text-sm">
					{imp.savedCount} question{imp.savedCount > 1 ? 's' : ''} déjà importée{imp.savedCount > 1 ? 's' : ''}.
					Les questions restantes ont échoué, corrigez-les puis réessayez.
				</CustomText>
			)}
		</Box>

		<ImportPreviewList
			drafts={imp.drafts}
			setDrafts={imp.setDrafts}
			typeIds={imp.typeIds}
			disabled={imp.isSaving}
		/>
	</Box>
)

// ---- Step 3: confirmation ----
const ImportDoneStep = ({ imp }: { imp: ImportState }) => (
	<Box direction="column" className="w-full items-center gap-3 py-6">
		<FAIcon name="check-circle" size="xl" className="text-success" />
		<CustomText weight="bold">
			{imp.savedCount} question{imp.savedCount > 1 ? 's' : ''} importée{imp.savedCount > 1 ? 's' : ''} avec succès
		</CustomText>
	</Box>
)

// The Modal only renders ONE child (it uses Children.toArray + an index), so everything lives in one component.
const ImportBody = ({ imp }: { imp: ImportState }) => (
	<div className="w-[min(70vw,60rem)]">
		{imp.step === 'input' && <ImportSourceStep imp={imp} />}
		{imp.step === 'preview' && <ImportPreviewStep imp={imp} />}
		{imp.step === 'done' && <ImportDoneStep imp={imp} />}
	</div>
)

interface ModalQuestionImportProps {
	open: boolean
	closeModal: () => void
}

const ModalQuestionImport = ({ open, closeModal }: ModalQuestionImportProps) => {

	const imp = useImportQuestions()

	const handleClose = () => {
		if (imp.isAnalyzing || imp.isSaving) return
		imp.reset()
		closeModal()
	}

	const selected = imp.selectedCount

	let footer
	if (imp.step === 'input') {
		footer = (
			<ActionButton
				onClick={imp.handleAnalyze}
				disabled={!imp.canAnalyze}
				isLoading={imp.isAnalyzing}
			>
				Analyser avec l'IA
			</ActionButton>
		)
	} else if (imp.step === 'preview') {
		footer = (
			<Box className="w-full justify-between gap-3">
				<ActionButton
					btnColor="white"
					textColor="text"
					onClick={imp.backToInput}
					disabled={imp.isSaving}
				>
					← Changer de source
				</ActionButton>
				<ActionButton
					onClick={imp.handleSave}
					disabled={!imp.canSave}
					isLoading={imp.isSaving}
				>
					{`Importer ${selected} question${selected > 1 ? 's' : ''}`}
				</ActionButton>
			</Box>
		)
	} else {
		footer = <ActionButton onClick={handleClose}>Fermer</ActionButton>
	}

	return (
		<Modal
			title="Importer des questions (IA)"
			isOpen={open}
			closeModal={handleClose}
			footer={footer}
		>
			<ImportBody imp={imp} />
		</Modal>
	)
}

export default ModalQuestionImport;
