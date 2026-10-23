import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Box from "../../atoms/Container/Box";
import Paper from "../../atoms/Container/Paper";
import CustomText from "../../atoms/Text/CustomText";
import Input from "../../atoms/Form/Input";
import FAIcon from "../../atoms/Icon/FAIcon"; // Assurez-vous du chemin
import apiClient from "../../../other/services/apiClient";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";

type ProfileData = {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
    avatar?: string | null; // <-- Ajout du champ avatar
};

interface ProfileDetailsCardProps {
    profile: ProfileData;
    role: string;
    initial: string;
}

const ProfileDetailsCard: React.FC<ProfileDetailsCardProps> = ({ profile, role, initial }) => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        username: profile.username || "",
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
    });

    const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 1. Mutation pour la mise à jour des infos (Texte)
    const textMutation = useMutation({
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

    // 2. Mutation spécifique pour l'image (FormData)
    const pictureMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("avatar", file); 
            const { data } = await apiClient.patch("accounts/profile/me/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile-me"] });
        },
        onError: (error) => {
            console.error("Erreur lors de l'upload de l'image", error);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        textMutation.mutate(formData);
    };

    const handleCancel = () => {
        setFormData({
            username: profile.username || "",
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
        });
        setIsEditing(false);
    };

    // Gestion de l'upload d'image
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            pictureMutation.mutate(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Réinitialise l'input
        }
    };

    const triggerFileInput = () => {
        if (!pictureMutation.isPending && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <Paper className="w-full p-6">
            <form onSubmit={handleSubmit}>
                <Box direction="column" className="w-full gap-6">
                    <Box className="items-center justify-between flex-wrap gap-4">
                        
                        <Box className="items-center gap-5">
                            {/* --- ZONE AVATAR CLIQUABLE --- */}
                            <Box 
                                className="relative w-20 h-20 rounded-full flex items-center justify-center bg-secondary text-primary border-2 border-white shadow-sm overflow-hidden group cursor-pointer flex-shrink-0"
                                onClick={triggerFileInput}
                            >
                                {profile.avatar ? (
                                    <img 
                                        src={profile.avatar} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <CustomText textTag="h2" weight="bold" className="text-2xl">
                                        {initial}
                                    </CustomText>
                                )}

                                {/* Overlay au survol */}
                                <Box className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all duration-200">
                                    {pictureMutation.isPending ? (
                                        <FAIcon name="spinner" className="text-white animate-spin" />
                                    ) : (
                                        <FAIcon name="camera" className="text-white" />
                                    )}
                                </Box>

                                {/* Input caché */}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/jpeg, image/png, image/webp"
                                    onChange={handleFileChange}
                                />
                            </Box>

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
                            <ActionButton type="button" onClick={() => setIsEditing(true)}>
                                Éditer le profil
                            </ActionButton>
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
                                    <ActionButton type="button" onClick={handleCancel} disabled={textMutation.isPending}>
                                        Annuler
                                    </ActionButton>
                                    <ActionButton type="submit" disabled={textMutation.isPending}>
                                        {textMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                                    </ActionButton>
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