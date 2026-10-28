import { useQuery } from "@tanstack/react-query";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import Loading from "../../../system/atoms/Loading/Loading";
import CustomText from "../../../system/atoms/Text/CustomText";
import { useAuth } from "../../../other/hooks/auth/useAuth";
import { useTabNavigation } from "../../../other/hooks/navigation/useTabNavigation";
import apiClient from "../../../other/services/apiClient";
import NavigationBar from "../../../system/molecules/Navigation/NavigationBar";
import BodyLayout from "../../layout/common/BodyLayout";

import ProfileDetailsCard from "../../../system/organisms/profile/ProfileDetailsCard"; 
import PasswordResetRequestCard from "../../../system/organisms/profile/PasswordResetRequestCard";
import ThemeSettingsCard from "../../../system/organisms/profile/ThemeSettingsCard";
import Collapse from "../../../system/molecules/Container/Collapse";

type ProfileMeResponse = {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
};

const ProfileMePage = () => {
    const { authUser } = useAuth();
    const { activeTab, handleTabChange } = useTabNavigation({ paramName: "profile-tab" });

    const { data: profile, isPending, isError } = useQuery({
        queryKey: ["profile-me"],
        queryFn: async () => {
            const { data } = await apiClient.get<ProfileMeResponse>("accounts/profile/me/");
            return data;
        },
        staleTime: 60_000,
    });

    if (isPending) return <Loading message="Chargement du profil..." />;
    if (isError || !profile) return (
        <BodyLayout title="Paramètres">
            <Box className="w-full justify-center">
                <Paper className="p-6">
                    <CustomText>Impossible de charger votre profil.</CustomText>
                </Paper>
            </Box>
        </BodyLayout>
    );

    const role = profile.role || authUser?.role || "apprenant";
    const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username;
    const initial = (displayName || profile.username || "U").charAt(0).toUpperCase();
    const isAdmin = role === "admin";

    return (
        <BodyLayout title="Paramètres">
            <Box direction="column" className="w-full gap-6 pb-8">
                <NavigationBar
                    titles={["Profil", "Paramètres"]}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                >
                    {/* ONGLET 1 : PROFIL */}
                    <ProfileDetailsCard 
                        profile={profile} 
                        role={role} 
                        initial={initial} 
                    />

                    {/* ONGLET 2 : PARAMÈTRES */}
                    <Box direction="column" className="w-2/3 m-auto gap-6">
                        <Paper className="w-full p-6">
                            <Box direction="column" className="w-full gap-4">
                                <Box direction="column" className="gap-1">
                                    <CustomText textTag="h3" weight="bold">Options de compte</CustomText>
                                    <CustomText textTag="h6" color="disabled">
                                        Gérez vos préférences de sécurité et vos paramètres de compte.
                                    </CustomText>
                                </Box>

								<Collapse iconTitle="palette" title={
										<CustomText textTag="p" weight="bold" className="text-primary">Apparence</CustomText>
									}
								><ThemeSettingsCard /></Collapse>

								{ !isAdmin &&
									<Collapse iconTitle="lock" title={
											<CustomText textTag="p" weight="bold" className="text-primary">Sécurité</CustomText>
										}
									><PasswordResetRequestCard /></Collapse>
								}

								<Collapse iconTitle="bell" title={
										<CustomText textTag="p" weight="bold" className="text-primary">Notifications</CustomText>
									}
								>
									<CustomText color="disabled" className="text-sm">
										Les options de notification seront bientôt disponibles.
                                    </CustomText>								
								</Collapse>
                            </Box>
                        </Paper>
                    </Box>
                </NavigationBar>
            </Box>
        </BodyLayout>
    );
};

export default ProfileMePage;