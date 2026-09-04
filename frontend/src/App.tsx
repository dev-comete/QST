import { RouterProvider } from 'react-router/internal/react-server-client'
import { router } from './other/routes/route'
import { AuthProvider } from './product/context/AuthProvider'
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { queryClient } from './other/lib/queryClient';

function App() {

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<RouterProvider router={router} />
			</AuthProvider>
			<ToastContainer position="bottom-right" autoClose={3000} />
		</QueryClientProvider>
	)
}

export default App
