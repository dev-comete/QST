import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import CustomText from "../../../atoms/Text/CustomText";
import Button from "../../../atoms/Button/Button";
import Loading from "../../../atoms/Loading/Loading";
import apiClient from "../../../../other/services/apiClient";

type ResetRequest = {
    id: number;
    user_email: string;
    user_name: string;
    role: string;
    status: string;
    requested_at: string;
};

const PasswordResetList = () => {
    const queryClient = useQueryClient();

    const { data: requests, isPending } = useQuery({
        queryKey: ["password-resets", "pending"],
        queryFn: async () => {
            const { data } = await apiClient.get<ResetRequest[]>("admin/password-resets/?status=pending");
            return data;
        }
    });

    const approveMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.post(`admin/password-resets/${id}/approve/`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["password-resets", "pending"] });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiClient.post(`admin/password-resets/${id}/reject/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["password-resets", "pending"] });
        }
    });

    if (isPending) return <Loading message="Chargement des demandes..." />;

    return (
        <Paper className="w-full p-6">
            <Box direction="column" className="w-full gap-6">
                <Box direction="column" className="gap-1">
                    <CustomText textTag="h3" weight="bold">Demandes de réinitialisation</CustomText>
                    <CustomText textTag="h6" color="disabled">
                        Gérez les utilisateurs ayant oublié leur mot de passe.
                    </CustomText>
                </Box>

                <Box direction="column" className="gap-4">
                    {requests?.length === 0 ? (
                        <Box className="p-6 justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <CustomText color="disabled">Aucune demande en attente.</CustomText>
                        </Box>
                    ) : (
                        requests?.map((req) => (
                            <Box key={req.id} className="p-4 border border-background rounded-xl items-center justify-between flex-wrap gap-4">
                                <Box direction="column" className="gap-1">
                                    <CustomText textTag="p" weight="bold">
                                        {req.user_name} <CustomText textTag="span" color="disabled" className="font-normal text-sm">({req.user_email})</CustomText>
                                    </CustomText>
                                    <CustomText textTag="p" className="text-sm capitalize text-primary font-medium">
                                        Rôle : {req.role}
                                    </CustomText>
                                </Box>
                                
                                <Box className="gap-2">
                                    <Button 
                                        variant="outline" 
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => rejectMutation.mutate(req.id)}
                                        disabled={approveMutation.isPending || rejectMutation.isPending}
                                    >
                                        Rejeter
                                    </Button>
                                    <Button 
                                        onClick={() => approveMutation.mutate(req.id)}
                                        disabled={approveMutation.isPending || rejectMutation.isPending}
                                    >
                                        Approuver et envoyer l'e-mail
                                    </Button>
                                </Box>
                            </Box>
                        ))
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default PasswordResetList;