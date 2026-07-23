import { createBrowserRouter } from "react-router";
import Test from "../../product/pages/Test";
import FormateurTemplate from "../../product/layout/FormateurTemplate";
import BankQuestion from "../../product/pages/formateur/BankQuestion";
import Planning from "../../product/pages/formateur/Planning";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Test />,
	},
	{
		path: "/formateur",
		element: <FormateurTemplate />,
		children: [
			{
				index: true,
				path: "planning",
				element: <Planning />
			},
			{
				path: "bank-question",
				element: <BankQuestion />
			}
		]
	}
]);

