import { createBrowserRouter } from "react-router";
import Text from "../../system/atoms/Text";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div>
		<Text type="h1" color="disabled">Testing</Text>
	</div>,
  },
]);

