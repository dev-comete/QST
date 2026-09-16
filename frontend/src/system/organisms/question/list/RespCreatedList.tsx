import { type Dispatch, type SetStateAction } from "react"
import type { respType } from "../../../../other/types/questionType"
import Box from "../../../atoms/Container/Box"
import Info from "../../../atoms/Form/Info"
import TextArea from "../../../atoms/Form/TextArea"
import Input from "../../../atoms/Form/Input"

interface RespItemProps {
	id: number,
	response: respType,
	handleRemove: () => void,
	handleSelectTrue: () => void
	handleOnChange: () => void
}

const RespItem = ({ id, response, handleRemove, handleSelectTrue, handleOnChange } : RespItemProps) => {
	return (
		<Box direction="column" className="gap-2">
			<Input id='resp' name='response' type='checkbox' onChange={handleSelectTrue}/>
			<TextArea
				id={"enonce" + id}
				name={"enonce"}
				label="Enoncé"
				value={response.reponse}
				onChange={handleOnChange}
				required={true}
				placeholder="Exemple: Parler doucement"
			/>
			{
				response.est_correct &&
				<TextArea
					id={"explication" + id}
					name={"explication"}
					label="Explication"
					value={response.reponse}
					onChange={handleOnChange}
					required={true}
					placeholder="Exemple: Parler doucement"
				/>

			}
		</Box>
	)
}

interface RespCreatedListProps {
	responses: respType[]
	setResponses: Dispatch<SetStateAction<respType[]>>
}

const RespCreatedList = ({ responses, setResponses } : RespCreatedListProps) => {
    
    const handleRemove = (index: number) => {
        setResponses((prev) => ({
            ...prev,
            options: prev.filter((_, i) => i !== index)
        }));
    };
	
	const handleCheckboxChange = (index: number, isChecked: boolean) => {
		setResponses((prev) => ({
			...prev,
			options: prev.map((item, i) =>
				i === index ? { ...item, est_correct: isChecked } : item
		)
		}));
    };

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Info info="Veuillez créer au moins deux réponses, les réponses vraies doivent avoir une explication"/>
			{
				responses.map((r, index) => 
				<RespItem 
					response={r}
					id={index}
					handleOnChange={}
					handleRemove={() => handleRemove(index)}
					handleSelectTrue={() => handleCheckboxChange(index)}
				/>)
			}
		</Box>
	)
}

export default RespCreatedList
