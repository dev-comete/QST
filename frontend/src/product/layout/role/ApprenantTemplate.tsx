import type { NavItem } from "../../../other/types/common";
import Layout from "../common/Layout";

const ApprenantTemplate = () => {

	const navList : NavItem[] = [
		{ label: 'Calendrier de quiz', link: '/apprenant/calendrier_quiz', title: 'Calendrier de quiz' },
		{ label: 'Bulletin de notes', link: '/apprenant/bulletin', title: 'Bulletin de notes' },
	]

	return (
		<Layout navList={navList} />
	)
}

export default ApprenantTemplate;