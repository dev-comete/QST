import type { NavItem } from "../../../other/types/common";
import Layout from "../common/Layout";

const AdminTemplate = () => {

	const navList : NavItem[] = [
		{ label: 'Gestion des utilisateurs', link: '/admin/gestion_utilisateurs', icon: 'users' },
		{ label: 'Tableau de bord', link: '/admin/tableau_de_bord', icon:'chart-column' }
	]

	return (
		<Layout navList={navList} />
	)
}

export default AdminTemplate;