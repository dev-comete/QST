import type { NavItem } from "../../other/types/common";
import Layout from "./Layout";

const FormateurTemplate = () => {

	const navList : NavItem[] = [
		{ label: 'Plannification', link: '/formateur/planning' },
		{ label: 'Gestion de question', link: '/formateur/gestion_question' },
		{ label: 'Gestion de quizz', link: '/formateur/gestion_quizz' },
		{ label: 'Tableau de bord', link: '/formateur/tableau_de_bord' }
	]

	return (
		<Layout navList={navList} />
	)
}

export default FormateurTemplate;