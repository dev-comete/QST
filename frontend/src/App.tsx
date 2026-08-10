import { RouterProvider } from 'react-router/internal/react-server-client'
import { router } from './other/routes/route'
import { AuthProvider } from './product/context/AuthProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
		refetchOnWindowFocus: false,
		retry: 1,
		},
	},
});

function App() {

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<RouterProvider router={router} />
			</AuthProvider>
		</QueryClientProvider>
	)
}

export default App
