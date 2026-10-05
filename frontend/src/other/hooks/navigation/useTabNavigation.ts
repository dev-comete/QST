import { useSearchParams } from "react-router";

interface UseTabNavigationOptions {
	paramName?: string;
	defaultTab?: number;
}

export const useTabNavigation = (options: UseTabNavigationOptions = {}) => {
	const { paramName = 'tab', defaultTab = 0 } = options;
	const [searchParams, setSearchParams] = useSearchParams();

	const rawParam = searchParams.get(paramName);
	const parsed = rawParam !== null ? parseInt(rawParam, 10) : NaN;
	const activeTab = !isNaN(parsed) && parsed >= 0 ? parsed : defaultTab;

	const handleTabChange = (index: number) => {
		setSearchParams(
			(prev: URLSearchParams) => {
			const next = new URLSearchParams(prev);
			if (index === defaultTab) {
				next.delete(paramName);
			} else {
				next.set(paramName, index.toString());
			}
			return next;
			},
			{ replace: true }
		);
	};

	return { activeTab, handleTabChange };
};