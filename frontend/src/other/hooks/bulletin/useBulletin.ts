import { useQuery, useMutation } from "@tanstack/react-query"
import { BulletinService } from "../../services/bulletinService"

export const useBulletin = (vagueId?: string) => {

	const { data : bulletinList, status : bulletinListStatus } = useQuery({
		queryKey: ['bulletin_list'],
		queryFn: () => BulletinService.list()
	})

	const { data : myBulletin, status : myBulletinStatus } = useQuery({
		queryKey: ['my_bulletin', vagueId],
		queryFn: () => BulletinService.evalList(vagueId ?? ''),
		enabled: !!vagueId
	})

	return {
		bulletinList,
		bulletinListStatus,
		myBulletin,
		myBulletinStatus
	}
}

export const useExportBulletin = () => {
    
    const exportMutation = useMutation({
        mutationFn: (vagueId: string | number) => BulletinService.exportPdf(vagueId),
        onSuccess: (data, vagueId) => {
            // Création d'une URL locale pour le fichier binaire (Blob)
            const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
            
            // Création d'un lien HTML invisible pour forcer le téléchargement
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bulletin_Vague_${vagueId}.pdf`); 
            document.body.appendChild(link);
            
            link.click(); // Déclenche le téléchargement
            
            // Nettoyage de l'URL et du lien du DOM
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
        onError: (err) => {
            console.error("Erreur lors de l'export PDF:", err);
        },
    });

    return {
        handleExportPdf: exportMutation.mutateAsync,
        isExporting: exportMutation.isPending
    }
}