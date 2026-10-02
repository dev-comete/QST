import Box from "../../../atoms/Container/Box";
import TextArea from "../../../atoms/Form/TextArea";
import Select from "../../../atoms/Form/Select";
import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import BaremeInput from "../../globalParam/input/BaremeInput";
import { type Dispatch, type SetStateAction } from "react";
import type { questionIdType, questionType } from "../../../../other/types/questionType";

interface EnonceFormProps {
	question: questionType
	setQuestion: Dispatch<SetStateAction<questionType>>
	questionType: questionIdType[]
}

export const EnonceForm = ({ question, setQuestion, questionType} : EnonceFormProps) => {

	const selectionQuestionType = getSelectData(questionType, 'code')
	const selectedQuestionTypeCode = questionType.find((q) => q.id === question.type_id)?.code ?? questionType[0]?.code ?? ''

	return (
		<Box direction="column" className="w-full px-5 space-y-5">
			<Box className="w-full gap-2">
				<Box className="min-w-0 flex-1">
					<Select
						id={"type"}
						name={"type"}
						selectionValue={selectionQuestionType}
						label="Type de question"
						handleChange={formChangeHandler(setQuestion, 'type_id', (value) => {
							const realId = questionType.find((q) => q.code === value)?.id ?? questionType[0]?.id ?? 0
							return Number(realId)
						})}
						value={selectedQuestionTypeCode}
					/>
				</Box>
				<Box className="min-w-0 flex-1">
					<BaremeInput onBaremeChange={() => formChangeHandler(setQuestion, 'bareme_pts')} />
				</Box>
			</Box>
			<TextArea
				id={"enonce"}
				name={"enonce"}
				label="Enoncé"
				row={5}
				value={question.enonce_question}
				onChange={formChangeHandler(setQuestion, 'enonce_question')}
				required={true}
				placeholder="Exemple: Comment parler à un client ?"
			/>
		</Box>
	)
}