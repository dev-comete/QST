import { useMutation } from "@tanstack/react-query";
import { QuestionService } from "../../services/questionService"; // Import de l'objet complet

export const useDistractor = () => {
    return useMutation<string[], Error, { enonce: string; bonne_reponse: string }>({
        // Utilisation de QuestionService.generateDistractors
        mutationFn: (data) => QuestionService.generateDistractors(data.enonce, data.bonne_reponse),
        onError: (error: any) => {
            console.error("Erreur lors de la génération IA:", error);
        }
    });
};