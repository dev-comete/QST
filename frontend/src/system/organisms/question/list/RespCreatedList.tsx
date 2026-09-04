import { useQuestionCreate } from "../../../../other/hooks/question/useQuestionCreate"
import type { respType } from "../../../../other/types/questionType"
import Box from "../../../atoms/Container/Box"
import Input from "../../../atoms/Form/Input"
import { Table, type Column } from "../../../atoms/Table/Table"
import IconButton from "../../../molecules/Buttons/IconButton"

const getResponseColumns = (
    onToggleCorrect: (index: number, isChecked: boolean) => void,
    onRemove: (index: number) => void
): Column<respType>[] => [
    {
        header: 'Sélection',
        key: "est_correct",
        render: (value, _record, index) => (
            <Input
				id={`check + ${index}`}
				name={`check + ${index}`}
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => typeof index === 'number' && onToggleCorrect(index, e.target.checked)}
                className="cursor-pointer h-4 w-4 rounded"
            />
        )
    },
    {
        header: "Réponse",
        key: "reponse"
    },
    {
        header: "Action",
        key: 'id',
        render: (_value, _record, index) => (
            <IconButton
                iconName="trash"
                iconStyling="text-text hover:text-error"
                action={() => typeof index === 'number' && onRemove(index)}
            />
        )
    }
];

const RespCreatedList = () => {

	const { question, setQuestion } = useQuestionCreate()
    
    const handleRemove = (index: number) => {
        setQuestion((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };
	
	const handleCheckboxChange = (index: number, isChecked: boolean) => {
		setQuestion((prev) => ({
			...prev,
			options: prev.options.map((item, i) =>
				i === index ? { ...item, est_correct: isChecked } : item
		)
		}));
    };

    const columns = getResponseColumns(handleCheckboxChange, handleRemove);

	return (
		<Box direction="column" className="w-full items-center justify-center">
			<Table 
				columns={columns}
				data={question.options}
				rowKey={'reponse'}
			/>
		</Box>
	)
}

export default RespCreatedList
