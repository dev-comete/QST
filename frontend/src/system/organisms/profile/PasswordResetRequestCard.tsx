import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Paper from "../../atoms/Container/Paper";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import Button from "../../atoms/Button/Button";
import apiClient from "../../../other/services/apiClient";
import { useAuth } from "../../../other/hooks/auth/useAuth";

const PasswordResetRequestCard = () => {
    const { authUser } = useAuth();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const mutation = useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post("/accounts/auth/request-password-reset/", {
                email: authUser?.email,
            });
            return data;
        },
        onSuccess: (data) => {
            setSuccessMessage(
                data.detail || "Votre demande de réinitialisation a été envoyée à l'administrateur avec succès."
            );
            setErrorMessage("");
        },
        onError: (error: any) => {
            setErrorMessage(
                error.response?.data?.detail || "Une erreur est survenue lors de la soumission de la demande."
            );
            setSuccessMessage("");
        },
    });

    return (
        <Paper className="w-full p-6">
            <Box direction="column" className="gap-4">
                <Box direction="column" className="gap-1">
                    <CustomText textTag="h3" weight="bold">
                        Réinitialisation du mot de passe
                    </CustomText>
                    <CustomText textTag="p" color="disabled" className="text-sm">
                        En cas d'oubli ou si vous souhaitez réinitialiser votre mot de passe via un lien sécurisé, envoyez une demande à l'administrateur.
                    </CustomText>
                </Box>

                {successMessage && (
                    <Box className="p-3 bg-green-50 border border-green-200 rounded-xl">
                        <CustomText textTag="p" className="text-green-700 text-sm">
                            {successMessage}
                        </CustomText>
                    </Box>
                )}

                {errorMessage && (
                    <Box className="p-3 bg-red-50 border border-red-200 rounded-xl">
                        <CustomText textTag="p" className="text-red-600 text-sm">
                            {errorMessage}
                        </CustomText>
                    </Box>
                )}

                <Box className="pt-2">
                    <Button
                        variant="outline"
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !!successMessage}
                    >
                        {mutation.isPending
                            ? "Envoi de la demande..."
                            : "Demander une réinitialisation de mot de passe"}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default PasswordResetRequestCard;