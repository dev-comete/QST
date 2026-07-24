import type { NavItem } from "../../../other/types/common";
import NavButton from "../../../system/molecules/Buttons/NavButton";

interface SideBarProps {
	navList : NavItem[],
}

const SideBar = ({ navList } : SideBarProps ) => {

	return (
		<div className="flex flex-col bg-primary min-h-screen items-end flex-1 pt-5">
			<nav className="w-[90%]">
			{
				navList.map((navItem, index) => {
					const { label, link } = navItem
					return (
						<NavButton
							key={`Label + ${index}`}
							link={link}
							customStyling="w-full"
						>
							{label}
						</NavButton>
					)
				})
			}
			</nav>
		</div>
	)
}

export default SideBar;