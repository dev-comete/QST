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

type ProfileMeResponse = {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	role?: string;
	is_staff?: boolean;
	is_superuser?: boolean;
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
	if (isError || !profile) return <BodyLayout title="Paramètres"><Box className="w-full justify-center"><Paper className="p-6"><CustomText>Impossible de charger votre profil.</CustomText></Paper></Box></BodyLayout>;

	const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username;
	const role = profile.role || authUser?.role || "apprenant";
	const initial = (displayName || profile.username || "U").charAt(0).toUpperCase();

	return (
		<BodyLayout title="Paramètres">
			<Box direction="column" className="w-full gap-6 pb-8">
				<NavigationBar
					titles={["Profil", "Paramètres"]}
					activeTab={activeTab}
					onTabChange={handleTabChange}
				>
					<Paper className="w-full p-6">
						<Box direction="column" className="w-full gap-6">
							<Box className="items-center gap-5 flex-wrap">
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

							<Box direction="column" className="w-full gap-4">
								<Box direction="column" className="gap-1">
									<CustomText textTag="h6" color="disabled">Nom d'utilisateur</CustomText>
									<CustomText textTag="p" weight="bold">{profile.username}</CustomText>
								</Box>

								<Box direction="column" className="gap-1">
									<CustomText textTag="h6" color="disabled">Adresse e-mail</CustomText>
									<CustomText textTag="p" weight="bold">{profile.email}</CustomText>
								</Box>

								<Box direction="column" className="gap-1">
									<CustomText textTag="h6" color="disabled">Rôle</CustomText>
									<CustomText textTag="p" weight="bold" className="capitalize">{role}</CustomText>
								</Box>
							</Box>
						</Box>
					</Paper>

					<Paper className="w-full p-6">
						<Box direction="column" className="w-full gap-4">
							<CustomText textTag="h3" weight="bold">Options de compte</CustomText>
							<CustomText textTag="h6" color="disabled">
								Ajoutez ici les réglages à venir : sécurité, préférences, notifications, etc.
							</CustomText>
							<Box direction="column" className="w-full gap-2">
								<div className="rounded-xl border border-background bg-slate-50 p-3">
									<CustomText textTag="p" weight="bold">Sécurité</CustomText>
								</div>
								<div className="rounded-xl border border-background bg-slate-50 p-3">
									<CustomText textTag="p" weight="bold">Notifications</CustomText>
								</div>
								<div className="rounded-xl border border-background bg-slate-50 p-3">
									<CustomText textTag="p" weight="bold">Préférences</CustomText>
								</div>
							</Box>
						</Box>
					</Paper>
				</NavigationBar>
			</Box>
		</BodyLayout>
	);
};

export default ProfileMePage;
