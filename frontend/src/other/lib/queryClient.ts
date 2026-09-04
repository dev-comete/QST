// src/lib/queryClient.js
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast, type ToastContent } from 'react-toastify';

interface CustomMeta {
	successMessage?: ToastContent<unknown>;
	suppressToast?: boolean;
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
		refetchOnWindowFocus: false,
		retry: 1,
		},
	},

	queryCache: new QueryCache({
		onError: (error, query) => {
			if (query.meta?.suppressToast) return;

			toast.error(`Erreur : ${error.message}`);
		},
	}),

	mutationCache: new MutationCache({
		onError: (error, _variables, _context, mutation) => {
			if (mutation.meta?.suppressToast) return;

			toast.error(`Echec : ${error.message}`);
		},
		onSuccess: (_data, _variables, _context, mutation) => {
			const meta = mutation.meta as CustomMeta | undefined;

			if (meta?.suppressToast) return;

			const message = meta?.successMessage ?? null;
			toast.success(`Succès ${message ? ': ' + message : ''}`);
		},
	}),
});