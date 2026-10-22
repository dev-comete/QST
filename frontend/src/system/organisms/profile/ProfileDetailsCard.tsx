import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Box from "../../atoms/Container/Box";
import Paper from "../../atoms/Container/Paper";
import CustomText from "../../atoms/Text/CustomText";
import Button from "../../atoms/Button/Button"; 
import Input from "../../atoms/Form/Input";
import apiClient from "../../../other/services/apiClient";

type ProfileData = {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
};

interface ProfileDetailsCardProps {
    profile: ProfileData;
    role: string;
    initial: string;
}

const ProfileDetailsCard: React.FC<ProfileDetailsCardProps> = ({ profile, role, initial }) => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        username: profile.username || "",
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
    });

    const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const mutation = useMutation({
        mutationFn: async (updatedData: typeof formData) => {
            const { data } = await apiClient.patch("accounts/profile/me/", updatedData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile-me"] });
            setIsEditing(false);
        },
        onError: (error) => {
            console.error("Erreur lors de la mise à jour du profil", error);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleCancel = () => {
        setFormData({
            username: profile.username || "",
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
        });
        setIsEditing(false);
    };

    return (
        <Paper className="w-full p-6">
            <form onSubmit={handleSubmit}>
                <Box direction="column" className="w-full gap-6">
                    <Box className="items-center justify-between flex-wrap gap-4">
                        <Box className="items-center gap-5">
                            <div className="w-20 h-20 rounded-full bg-secondary text-primary text-2xl font-bold flex items-center justify-center shadow-sm">
                                {initial}
                            </div>
                            <Box direction="column" className="gap-1">
                                <CustomText textTag="h2" weight="bold" color="primary">
                                    {displayName}
                                </CustomText>
                                <CustomText textTag="h6" color="disabled" className="capitalize">
                                    {role}
                                </CustomText>
                            </Box>
                        </Box>
                        
                        {!isEditing && (
                            <Button type="button" onClick={() => setIsEditing(true)}>
                                Éditer le profil
                            </Button>
                        )}
                    </Box>

                    <Box direction="column" className="w-full gap-4">
                        {isEditing ? (
                            <>
                                <Box direction="column" className="gap-1">
                                    <CustomText textTag="h6" color="disabled">Nom d'utilisateur</CustomText>
                                    <Input 
                                        id="username"
                                        name="username" 
                                        value={formData.username} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </Box>
                                <Box direction="column" className="gap-1">
                                    <CustomText textTag="h6" color="disabled">Prénom</CustomText>
                                    <Input 
                                        id="first_name"
                                        name="first_name" 
                                        value={formData.first_name} 
                                        onChange={handleChange} 
                                    />
                                </Box>
                                <Box direction="column" className="gap-1">
                                    <CustomText textTag="h6" color="disabled">Nom de famille</CustomText>
                                    <Input 
                                        id="last_name"
                                        name="last_name" 
                                        value={formData.last_name} 
                                        onChange={handleChange} 
                                    />
                                </Box>
                                <Box direction="column" className="gap-1 opacity-60">
                                    <CustomText textTag="h6" color="disabled">Adresse e-mail</CustomText>
                                    <Input 
                                        id="email"
                                        name="email" 
                                        value={profile.email} 
                                        disabled 
                                    />
                                </Box>
                                
                                <Box className="gap-3 mt-4 justify-end">
                                    <Button type="button" onClick={handleCancel} disabled={mutation.isPending}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={mutation.isPending}>
                                        {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box direction="column" className="gap-1">
                                    <CustomText textTag="h6" color="disabled">Nom d'utilisateur</CustomText>
                                    <CustomText textTag="p" weight="bold">{profile.username}</CustomText>
                                </Box>
                                <Box direction="column" className="gap-1">
                                    <CustomText textTag="h6" color="disabled">Adresse e-mail</CustomText>
                                    <CustomText textTag="p" weight="bold">{profile.email}</CustomText>
                                </Box>
                                <Box direction="column" className="gap-1">
                                    <CustomText textTag="h6" color="disabled">Nom complet</CustomText>
                                    <CustomText textTag="p" weight="bold">
                                        {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}` : "Non renseigné"}
                                    </CustomText>
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </form>
        </Paper>
    );
};

export default ProfileDetailsCard;