import type { NavItem } from "../../other/types/common";
import Layout from "./Layout";

const ApprenantTemplate = () => {

	const navList : NavItem[] = [
		{ label: 'Calendrier de quiz', link: '/apprenant/calendrier_quiz' },
		{ label: 'Gestion de question', link: '/apprenant/bulletin' },
	]

	return (
		<Layout navList={navList} />
	)
}

export default ApprenantTemplate;