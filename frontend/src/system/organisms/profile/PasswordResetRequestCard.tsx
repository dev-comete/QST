import Paper from "../../atoms/Container/Paper";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import Button from "../../atoms/Button/Button";
import { useAuth, useResetPassword } from "../../../other/hooks/auth/useAuth";

const PasswordResetRequestCard = () => {
    const { authUser } = useAuth();
	const { errorMessage, successMessage, passwordMutation } = useResetPassword(authUser?.email ?? '')

	if (!authUser?.email) return null

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
                        onClick={() => passwordMutation.mutate()}
                        disabled={passwordMutation.isPending || !!successMessage}
                    >
                        {passwordMutation.isPending
                            ? "Envoi de la demande..."
                            : "Demander une réinitialisation de mot de passe"}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default PasswordResetRequestCard;