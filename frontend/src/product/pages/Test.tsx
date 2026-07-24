/* This is just a test page for the component */
import { useState } from "react";
import Select from "../../system/atoms/Form/Select";
import { type Column } from "../../system/atoms/Table/Table";
import { Modal } from "../../system/molecules/Modal/Modal";
import ActionButton from "../../system/molecules/Buttons/ActionButton";

interface Question {
	id: string;
	enonce: string;
	type: string;
	action: string
}

const Test = () => {

	const selectValues = [
		{ id: '1', value: '1' },
		{ id: '2', value: '2' },
		{ id: '3', value: '3' },
	]

	const questionList: Question[] = [
		{ id: '1', enonce:"Comment faire une boucle for ? ", type:"QCM", action: selectValues[0].value},
		{ id: '2', enonce: "Comment faire un switch ?", type: "QCU", action: selectValues[0].value}
	]

	const columns: Column<Question>[] = [
		{
			header: 'Enoncé',
			key: "enonce"
		},
		{
			header: "Type",
			key: "type"
		},
		{
			header: "Action",
			key: 'action',
			render: () => (
				<Select values={selectValues}name="select"id="select" />
			)
		}
	]

	const [ open, setOpen ] = useState(false)

	return (
		<div className="flex flex-col p-5 gap-15">
			<ActionButton action={() => setOpen(true)}>Open Modal</ActionButton>
			<Modal
				title="Testing Modal"
				subtitle={['One', 'Two', 'Three']}
				isOpen={open}
				closeModal={() => setOpen(false)}
			>
				<p className="text-text">{"Page 1"}</p>
				<p className="text-text">{"Page 2"}</p>
				<p className="text-text">{"Page 3"}</p>
			</Modal>
		</div>
	)
}

export default Test;