import type { NavItem } from "../../../other/types/navigation";
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
			<div className="flex flex-col items-center flex-none w-full space-y-5 pb-5 pt-5">
				<Logo />
				<Avatar />
			</div>
			<nav className="flex flex-col flex-1 w-full pl-5 overflow-y-auto space-y-1">
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
			<div className="flex-none w-full mt-auto p-5 flex justify-center">
				<LogoutBtn />
			</div>
		</div>
	)
}

export default SideBar;