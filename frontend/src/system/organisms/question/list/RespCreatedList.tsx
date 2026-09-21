import { type ChangeEvent, type Dispatch, type SetStateAction } from "react"
import type { respType } from "../../../../other/types/questionType"
import Box from "../../../atoms/Container/Box"
import Info from "../../../atoms/Form/Info"
import TextArea from "../../../atoms/Form/TextArea"
import Input from "../../../atoms/Form/Input"
import IconButton from "../../../molecules/Buttons/IconButton"

interface RespItemProps {
    id: number;
    response: respType;
    handleRemove: () => void;
    handleSelectTrue: (e: ChangeEvent<HTMLInputElement>) => void;
    handleOnChange: (field: 'reponse' | 'explication', value: string) => void;
}

const RespItem = ({ id, response, handleRemove, handleSelectTrue, handleOnChange }: RespItemProps) => {
    return (
        <Box className={`border ${response.est_correct ? 'border-success bg-success-light' : 'border-background'} px-5 py-10 gap-2 w-full items-start rounded-xl relative`}>
			<Box>
				<Input 
					id={`resp_${id}`} 
					name="response" 
					type="checkbox" 
					checked={response.est_correct}
					onChange={handleSelectTrue}
				/>
			</Box>
			<Box direction="column" className={`w-full space-x-2 `}>
				<TextArea
					id={"enonce" + id}
					name="enonce"
					label="Enoncé"
					value={response.reponse}
					onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleOnChange('reponse', e.target.value)}
					required={true}
					placeholder="Enoncé"
				/>
				{response.est_correct && (
					<TextArea
						id={"explication" + id}
						name="explication"
						label="Explication"
						value={response.explication || ''}
						onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleOnChange('explication', e.target.value)}
						required={true}
						placeholder="Explication"
					/>
				)}
			</Box>
            <IconButton iconName="close" btnStyling="absolute right-1 top-1" action={handleRemove}/>
        </Box>
    );
};

interface RespCreatedListProps {
    responses: respType[];
    setResponses: Dispatch<SetStateAction<respType[]>>;
}

const RespCreatedList = ({ responses, setResponses }: RespCreatedListProps) => {
    const handleRemove = (index: number) => {
        setResponses((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCheckboxChange = (index: number, isChecked: boolean) => {
        setResponses((prev) =>
            prev.map((item, i) => (i === index ? { ...item, est_correct: isChecked } : item))
        );
    };

    const handleOnChange = (index: number, field: 'reponse' | 'explication', value: string) => {
        setResponses((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
    };

    return (
        <Box direction="column" className="w-full items-center justify-center">
            <Info info="Veuillez créer au moins deux réponses, les réponses vraies doivent avoir une explication" />
            {responses.map((r, index) => (
                <RespItem
                    key={'resp' + index}
                    id={index}
                    response={r}
                    handleRemove={() => handleRemove(index)}
                    handleSelectTrue={(e) => handleCheckboxChange(index, e.target.checked)}
                    handleOnChange={(field, value) => handleOnChange(index, field, value)}
                />
            ))}
        </Box>
    );
};

export default RespCreatedList;
