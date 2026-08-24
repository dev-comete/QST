import type { NavItem } from "../../../other/types/common";
import Layout from "../common/Layout";

const ApprenantTemplate = () => {

	const navList : NavItem[] = [
		{ label: 'Calendrier de quiz', link: '/calendrier_quiz', title: 'Calendrier de quiz', icon: 'calendar' },
		{ label: 'Bulletin de notes', link: '/bulletin', title: 'Bulletin de notes', icon: 'book-open' },
	]

	return (
		<Layout navList={navList} />
	)
}

export default ApprenantTemplate;