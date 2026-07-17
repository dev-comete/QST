/* This is just a test page for the component */

import { Form } from "react-router";
import Input from "../../system/atoms/Form/Input";
import Select from "../../system/atoms/Form/Select";
import TextArea from "../../system/atoms/Form/TextArea";
import CustomText from "../../system/atoms/Text/CustomText";
import ActionButton from "../../system/molecules/Buttons/ActionButton";
import ConfirmActionButton from "../../system/molecules/Buttons/ConfirmActionButton";
import NavButton from "../../system/molecules/Buttons/NavButton";
import { Table, type Column } from "../../system/atoms/Table/Table";

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

	return (
		<div className="flex flex-col p-5 gap-15">
			<div className="flex flex-col gap-5">
				<CustomText type="h1" color="primary" weight="bold">Button</CustomText>
				<NavButton link="/about">This is a navigation button</NavButton>
				<ActionButton btnColor="secondary" btnStyling="hover:bg-secondary-200"
					action={() => console.log("This is a test")}
				>Test action button</ActionButton>
				<ConfirmActionButton action={() => console.log("Test confirm modal")} btnColor="success">
					Click here to send the response !!!!
				</ConfirmActionButton>
			</div>
			<div className="flex flex-col gap-5">
				<CustomText type="h1" color="primary" weight="bold">Form components</CustomText>
				<Form>
					<Input label="Input" id="test" name="test" type="text" />
					<TextArea label="TextArea" id="textArea" name="textArea" />
					<Select label="Select"values={selectValues}name="select"id="select" />
				</Form>
			</div>
			<div>
				<CustomText type="h1" color="primary" weight="bold">Table components</CustomText>
				<Table columns={columns} data={questionList} rowKey="id" />
			</div>
		</div>
	)
}

export default Test;