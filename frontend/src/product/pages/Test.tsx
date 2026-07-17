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

interface User {
  id: number;
  name: string;
  role: "Admin" | "User";
  status: "Active" | "Inactive";
}

const Test = () => {

	const selectValues = [
		{ id: '1', value: '1' },
		{ id: '2', value: '2' },
		{ id: '3', value: '3' },
	]

	const users: User[] = [
		{ id: 1, name: "Alice", role: "Admin", status: "Active" },
		{ id: 2, name: "Bob", role: "User", status: "Inactive" },
	];

	const columns: Column<User>[] = [
    {
      header: "Name",
      accessor: "name", // Renders as plain text automatically
    },
    {
      header: "Role",
      accessor: "role",
      // Custom render to add an icon
      render: (value) => (
        <span className="flex items-center gap-1">
          {value === "Admin" ? "⭐" : "👤"} {String(value)}
        </span>
      ),
    },
    {
      header: "Status Action",
      accessor: "status",
      // Custom render to display an interactive dropdown
      render: (value, record) => (
        <select 
          value={String(value)} 
          onChange={(e) => alert(`Changing ${record.name} to ${e.target.value}`)}
          className="border rounded p-1"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      ),
    },
  ];

	return (
		<div className="flex flex-col p-5 gap-15">
			<div className="flex flex-col gap-5">
				<CustomText type="h1" color="primary" weight="bold">Button</CustomText>
				<NavButton link="/about">This is a navigation button</NavButton>
				<ActionButton
					btnColor="secondary"
					btnStyling="hover:bg-secondary-200"
					action={() => console.log("This is a test")}
				>Test action button</ActionButton>
				<ConfirmActionButton
					action={() => console.log("Test confirm modal")}
					btnColor="success"
				>
					Click here to send the response !!!!
				</ConfirmActionButton>
			</div>
			<div className="flex flex-col gap-5">
				<CustomText type="h1" color="primary" weight="bold">Form components</CustomText>
				<Form>
					<Input
						label="Input"
						id="test"
						name="test"
						type="text"
					/>
					<TextArea
						label="TextArea"
						id="textArea"
						name="textArea"
					/>
					<Select 
						label="Select"
						values={selectValues}
						name="select"
						id="select"
					/>
				</Form>
			</div>
			<div>
				<CustomText type="h1" color="primary" weight="bold">Table components</CustomText>
     			<Table columns={columns} data={users} rowKey="id" />
			</div>
		</div>
	)
}

export default Test;