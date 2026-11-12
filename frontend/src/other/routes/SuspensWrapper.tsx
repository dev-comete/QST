import { Suspense } from "react";
import Loading from "../../system/atoms/Loading/Loading";

export const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
	<Suspense fallback={<Loading />}>
		{children}
	</Suspense>
);