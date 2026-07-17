import { createBrowserRouter } from "react-router";
import Test from "../../product/pages/Test";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Test />,
  },
]);

