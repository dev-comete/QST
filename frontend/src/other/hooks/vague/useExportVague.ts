import { useMutation } from "@tanstack/react-query";
import { VagueService } from "../../services/vagueService";

export const useExportBulletin = () => {
    
    const exportMutation = useMutation({
        mutationFn: (vagueId: string | number) => VagueService.exportPdf(vagueId),
        onSuccess: (data, vagueId) => {
            // Création d'une URL locale pour le fichier binaire (Blob)
            const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
            
            // Création d'un lien HTML invisible pour forcer le téléchargement
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Equipe_${vagueId}.pdf`); 
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