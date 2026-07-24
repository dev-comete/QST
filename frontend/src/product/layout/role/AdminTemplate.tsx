import type { NavItem } from "../../../other/types/common";
import Layout from "../common/Layout";

const AdminTemplate = () => {

	const navList : NavItem[] = [
		{ label: 'Gestion des comptes', link: '/admin/gestion_compte' },
		{ label: 'Tableau de bord', link: '/admin/tableau_de_bord' }
	]

	return (
		<Layout navList={navList} />
	)
}

export default AdminTemplate;