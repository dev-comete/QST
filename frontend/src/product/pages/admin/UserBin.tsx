// frontend/src/product/pages/admin/UserBin.tsx
import Title from "../../../system/molecules/LayoutElement/Title";
import UserList from "../../../system/organisms/user/list/UserList";
import Box from "../../../system/atoms/Container/Box";
import { useProject } from "../../../other/hooks/user/useProject";
import Loading from "../../../system/atoms/Loading/Loading";
import FetchError from "../../../system/atoms/Loading/FetchError";

export default function UserBin() {
    // On récupère les projets pour l'affichage dans la table
    const { projectQuery } = useProject();
    
    if (projectQuery.isPending) return <Loading />;
    if (projectQuery.isError) return <FetchError />;

    return (
        <Box direction="column" className="w-full p-5 gap-5">
            <Title 
                title="Corbeille des utilisateurs" 
                subtitle="Consultez et restaurez les comptes désactivés."
                linkBack="parametre_general"
            />
            <UserList 
                projects={projectQuery.data ?? []} 
                listType="trash" 
            />
        </Box>
    );
}