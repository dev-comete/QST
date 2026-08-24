import type { NavItem } from "../../../other/types/common";
import Avatar from "../../../system/molecules/Avatar/Avatar";
import LogoutBtn from "../../../system/molecules/Buttons/LogoutBtn";
import NavButton from "../../../system/molecules/Buttons/NavButton";
import Logo from "../../../system/molecules/Logo/Logo";

interface SideBarProps {
	navList : NavItem[],
}

const SideBar = ({ navList } : SideBarProps ) => {

	return (
		<div className="flex flex-col w-full bg-white min-h-screen items-center flex-1 pt-5 space-y-5">
			<Logo />
			<Avatar />
			<nav className="flex flex-col flex-end w-full pl-5">
			{
				navList.map((navItem, index) => {
					const { label, link, icon } = navItem
					return (
						<NavButton
							key={`Label + ${index}`}
							link={link}
							icon={icon}
							className="w-full py-5"
						>
							{label}
						</NavButton>
					)
				})
			}
			</nav>
			<LogoutBtn />
		</div>
	)
}

export default SideBar;