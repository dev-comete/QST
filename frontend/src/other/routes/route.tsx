import { createBrowserRouter } from "react-router";
import CustomText from "../../system/atoms/Text/CustomText";
import NavButton from "../../system/molecules/Buttons/NavButton";
import ActionButton from "../../system/molecules/Buttons/ActionButton";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div className="flex flex-col p-5">
		<CustomText type="h1" color="primary">Testing</CustomText>
		<NavButton link="/about">About</NavButton>
		<ActionButton
			btnColor="primary"
			action={() => console.log("This is a test")}
		>Test</ActionButton>
	</div>,
  },
]);

