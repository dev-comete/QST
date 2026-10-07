import type { Dispatch, SetStateAction } from "react";
import Input from "../../../atoms/Form/Input";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import { Modal } from "../../../molecules/Modal/Modal";
import { formChangeHandler } from "../../../../other/helper/helper";
import { useCreateQuestionType } from "../../../../other/hooks/question/useQuestionType";
import type { QuestionTypePayload } from "../../../../other/types/questionType";

export interface QuestionTypeFormProps {
	questionType?: QuestionTypePayload
	setQuestionType: Dispatch<SetStateAction<QuestionTypePayload>>
	handleSubmit: (e: React.SubmitEvent) => void
}

const QuestionTypeForm = ({ handleSubmit, setQuestionType } : QuestionTypeFormProps ) => {

	return (
		<form
			id="questionTypeCreateForm"
			className="flex flex-col space-y-5 justify-center w-[80%] m-auto"
			onSubmit={handleSubmit}
		>
			<Input 
				id="type_question"
				name="type_question"
				label="Type de question"
				onChange={formChangeHandler(setQuestionType, 'type_question')}
				required={true}
			/>
			<Input 
				id="code"
				name="code"
				label="Code"
				onChange={formChangeHandler(setQuestionType, 'code')}
				required={true}
			/>
		</form>
	)
}

interface ModalQuestionTypeCreateProps {
	open: boolean;
	closeModal: () => void,
}

const ModalQuestionTypeCreate = ({ open, closeModal } : ModalQuestionTypeCreateProps) => {
	const {
		questionType,
		setQuestionType,
		handleCreateQuestionType,
		isPending,
	} = useCreateQuestionType()

	const handleOnCloseModal = () => {
		closeModal()
	}

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault()
		try {
			await handleCreateQuestionType()
			handleOnCloseModal()
		} catch (error) {
			console.log("Error", error)
		}
	}

	return (
		<Modal
			title="Création de type de question"
			isOpen={open}
			closeModal={handleOnCloseModal}
			footer={
				<ActionButton
					type="submit"
					form="questionTypeCreateForm"
					btnColor="primary"
					textColor="white"
					isLoading={isPending}
					disabled={questionType.type_question.trim().length == 0
						|| questionType.code.trim().length == 0}
				>
					Créer
				</ActionButton>
			}
		>
			<QuestionTypeForm
				questionType={questionType}
				setQuestionType={setQuestionType}
				handleSubmit={handleSubmit}
			/>
		</Modal>
	)
}

export default ModalQuestionTypeCreate;