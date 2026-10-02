import { useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react"
import type { respType } from "../../../../other/types/questionType"
import Box from "../../../atoms/Container/Box"
import TextArea from "../../../atoms/Form/TextArea"
import Input from "../../../atoms/Form/Input"
import IconButton from "../../../molecules/Buttons/IconButton"
import CustomText from "../../../atoms/Text/CustomText"

interface RespItemProps {
    id: number;
    response: respType;
    handleRemove: () => void;
    handleSelectTrue: (e: ChangeEvent<HTMLInputElement>) => void;
    handleOnChange: (field: 'reponse' | 'explication', value: string) => void;
    textareaRef?: (element: HTMLTextAreaElement | null) => void;
}

const RespItem = ({ id, response, handleRemove, handleSelectTrue, handleOnChange, textareaRef }: RespItemProps) => {
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
					label="Réponse"
					row={2}
					value={response.reponse}
					onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleOnChange('reponse', e.target.value)}
					required={true}
					placeholder="Veuillez écrire la réponse"
					ref={textareaRef}
				/>
				{response.est_correct && (
					<TextArea
						id={"explication" + id}
						name="explication"
						label="Explication"
						row={2}
						value={response.explication || ''}
						onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleOnChange('explication', e.target.value)}
						required={true}
						placeholder="Veuillez fournir une explication"
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
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
    const [currentIndex, setCurrentIndex] = useState(0);

    const navigateToResponse = (index: number) => {
        if (!responses.length) return;
        const safeIndex = (index + responses.length) % responses.length;
        setCurrentIndex(safeIndex);

        queueMicrotask(() => {
            const targetInput = textareaRefs.current[String(safeIndex)];
            if (targetInput) {
                targetInput.focus();
            }
        });
    };

    const handleRemove = (index: number) => {
        const nextResponses = responses.filter((_, i) => i !== index);
        setResponses(nextResponses);
        setCurrentIndex((prev) => {
            if (nextResponses.length === 0) return 0;
            if (prev >= nextResponses.length) return nextResponses.length - 1;
            if (prev > index) return prev - 1;
            return prev;
        });
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

	const addResponse = () => {
		const nextResponses = [
			...responses,
			{
				reponse: '',
				est_correct: false,
				explication: ''
			}
		];
		const lastIndex = nextResponses.length - 1;
		setResponses(nextResponses);
		setCurrentIndex(lastIndex);
		queueMicrotask(() => {
			const lastInput = textareaRefs.current[String(lastIndex)];
			if (lastInput) {
				lastInput.focus();
				lastInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}
		});
	}

    return (
        <Box direction="column" className="w-full items-center justify-center space-y-2">
            {responses.length > 1 && (
                <Box className="w-full items-center justify-between">
					<IconButton
						iconName="caret-left"
						action={() => navigateToResponse(currentIndex - 1)}
						disabled={currentIndex <= 0 }
					/>
						<CustomText textTag="span" weight="bold">
							{currentIndex + 1}/{responses.length}
						</CustomText>
					<IconButton
						iconName="caret-right"
						action={() => navigateToResponse(currentIndex + 1)}
						disabled={currentIndex + 1 >= responses.length}
					/>
                </Box>
            )}
            {responses[currentIndex] && (
                <div className="w-full">
                    <RespItem
                        id={currentIndex}
                        response={responses[currentIndex]}
                        handleRemove={() => handleRemove(currentIndex)}
                        handleSelectTrue={(e) => handleCheckboxChange(currentIndex, e.target.checked)}
                        handleOnChange={(field, value) => handleOnChange(currentIndex, field, value)}
                        textareaRef={(element) => {
                            textareaRefs.current[String(currentIndex)] = element;
                        }}
                    />
                </div>
            )}
			<div
				className={`
					border-2 border-primary w-full items-center
					justify-center p-5 rounded-xl cursor-pointer
					hover:bg-background border-dashed text-center
					sticky bottom-0 bg-white
				`}
				onClick={addResponse}
			>
				<CustomText weight="bold" color="primary">+ Ajouter une autre réponse</CustomText>
			</div>
        </Box>
    );
};

export default RespCreatedList;
