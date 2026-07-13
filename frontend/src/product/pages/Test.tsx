/* This is just a test page for the component */

import CustomText from "../../system/atoms/Text/CustomText";
import ActionButton from "../../system/molecules/Buttons/ActionButton";
import ConfirmActionButton from "../../system/molecules/Buttons/ConfirmActionButton";
import NavButton from "../../system/molecules/Buttons/NavButton";

const Test = () => {

	return (
		<div className="flex flex-col p-5 gap-5">
			<CustomText type="h1" color="primary">Testing</CustomText>
			<NavButton link="/about">This is a navigation button</NavButton>
			<ActionButton
				btnColor="secondary"
				btnStyling="hover:bg-secondary-200"
				action={() => console.log("This is a test")}
			>Test action button</ActionButton>
			<ConfirmActionButton
				action={() => console.log("Test confirm modal")}
				btnColor="secondary"
			>
				Click here to send the response !!!!
			</ConfirmActionButton>
	</div>
	)
}

export default Test;