import Layout from "./Layout";

type NavItem = {
    label: string;
    link: string;
};

const FormateurTemplate = () => {

	const navList : NavItem[] = [
		{ label: 'Plannification', link: '/formateur/planning' },
		{ label: 'Banque de question', link: '/formateur/bank-question' }
	]

	return (
		<Layout navList={navList} />
	)
}

export default FormateurTemplate;