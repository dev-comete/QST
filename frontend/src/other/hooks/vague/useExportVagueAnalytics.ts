import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { VagueService } from "../../services/vagueService";

export const useExportVagueAnalytics = () => {
	const exportMutation = useMutation({
		mutationFn: VagueService.exportAnalyticsPdf,
		meta: { suppressToast: true },
		onSuccess: ({ data, filename }) => {
			const url = window.URL.createObjectURL(data);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
			toast.success("Le rapport PDF a été téléchargé.");
		},
		onError: () => {
			toast.error("Impossible de générer le rapport PDF. Veuillez réessayer.");
		},
	});

	return {
		exportAnalyticsPdf: exportMutation.mutate,
		isExporting: exportMutation.isPending,
	};
};
