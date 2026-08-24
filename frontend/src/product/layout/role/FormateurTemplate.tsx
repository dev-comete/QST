import type { NavItem } from "../../../other/types/common";
import Layout from "../common/Layout";

const FormateurTemplate = () => {

	const navList : NavItem[] = [
		{ label: 'Gestion des vagues', link: '/formateur/gestion_vague', icon: 'calendar-days' },
		{ label: 'Gestion des questions', link: '/formateur/gestion_question', icon: 'circle-question' },
		{ label: 'Gestion des quiz', link: '/formateur/gestion_quiz', icon:'file-pen' },
		{ label: 'Tableau de bord', link: '/formateur/tableau_de_bord', icon:'chart-column' }
	]

	return (
		<Layout navList={navList} />
	)
}

export default FormateurTemplate;