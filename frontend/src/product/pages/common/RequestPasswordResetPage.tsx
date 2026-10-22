import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import CustomText from "../../../system/atoms/Text/CustomText";
import Button from "../../../system/atoms/Button/Button";
import Input from "../../../system/atoms/Form/Input";
import apiClient from "../../../other/services/apiClient";
import { Link } from "react-router";

const RequestPasswordResetPage = () => {
    const [email, setEmail] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const mutation = useMutation({
        mutationFn: async (userEmail: string) => {
            const { data } = await apiClient.post("auth/request-password-reset/", { email: userEmail });
            return data;
        },
        onSuccess: (data) => {
            setSuccessMessage(data.detail || "Demande envoyée avec succès.");
            setErrorMessage("");
        },
        onError: (error: any) => {
            setErrorMessage(error.response?.data?.detail || "Une erreur est survenue.");
            setSuccessMessage("");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) mutation.mutate(email);
    };

    return (
        <Box className="min-h-screen flex items-center justify-center p-4 bg-background w-full">
            <Paper className="w-full max-w-md p-8">
                <Box direction="column" className="gap-6 text-center">
                    <Box direction="column" className="gap-2">
                        <CustomText textTag="h2" weight="bold" color="primary">
                            Mot de passe oublié ?
                        </CustomText>
                        <CustomText textTag="p" color="disabled" className="text-sm">
                            Saisissez votre adresse e-mail. Si elle est associée à un compte, une demande de réinitialisation sera envoyée à l'administrateur.
                        </CustomText>
                    </Box>

                    {successMessage ? (
                        <Box direction="column" className="gap-4">
                            <Box className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                                <CustomText textTag="p">{successMessage}</CustomText>
                            </Box>
                            <Link to="/login" className="w-full">
                                <Button className="w-full">Retour à la connexion</Button>
                            </Link>
                        </Box>
                    ) : (
                        <form onSubmit={handleSubmit} className="w-full">
                            <Box direction="column" className="gap-4">
                                {errorMessage && (
                                    <Box className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <CustomText textTag="p" className="text-red-600 text-sm">
                                            {errorMessage}
                                        </CustomText>
                                    </Box>
                                )}
                                
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="Adresse e-mail"
                                    placeholder="jean.dupont@qst.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <Button type="submit" disabled={mutation.isPending || !email} className="w-full mt-2">
                                    {mutation.isPending ? "Envoi en cours..." : "Envoyer la demande"}
                                </Button>
                            </Box>
                        </form>
                    )}
                    
                    {!successMessage && (
                        <Link to="/login" className="text-primary hover:underline text-sm mt-4 inline-block">
                            <CustomText textTag="span">Retour à la connexion</CustomText>
                        </Link>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default RequestPasswordResetPage;