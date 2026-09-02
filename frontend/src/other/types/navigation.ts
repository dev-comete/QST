export type NavItem = {
    label: string;
    link: string;
	title?: string;
	icon?: string
};

export interface SideBarConfig {
	navItem: NavItem[]
}

const ROLE_CONFIGS: Record<string, SideBarConfig> = {
	admin: {
		navItem: [
			{ label: 'Gestion des utilisateurs', link: '/admin/gestion_utilisateurs', icon: 'users' },
			{ label: 'Tableau de bord', link: '/admin/tableau_de_bord', icon:'chart-column' },
			{ label: 'Gestion des vagues', link: '/admin/gestion_vague', icon: 'calendar-days' },
			{ label: 'Banque de questions', link: '/admin/gestion_question', icon: 'circle-question' },
			{ label: 'Gestion des quiz', link: '/admin/gestion_quiz', icon:'file-pen' },
		]
	},

	formateur: {
		navItem: [
			{ label: 'Gestion des vagues', link: '/formateur/gestion_vague', icon: 'calendar-days' },
			{ label: 'Banque de questions', link: '/formateur/gestion_question', icon: 'circle-question' },
			{ label: 'Gestion des quiz', link: '/formateur/gestion_quiz', icon:'file-pen' },
			{ label: 'Tableau de bord', link: '/formateur/tableau_de_bord', icon:'chart-column' }
		]
	
	},

	apprenant: {
		navItem: [
			{ label: 'Mes évaluations', link: '/my_eval', title: 'Mes évaluations', icon: 'calendar' },
			{ label: 'Mes bulletins de note', link: '/bulletin', title: 'Bulletin de notes', icon: 'graduation-cap' },
		]	
	}
}

export {
	ROLE_CONFIGS,
}