import { useState } from "react";
import Avatar from "../Avatar/Avatar";
import IconButton from "../Buttons/IconButton";
import LogoutBtn from "../Buttons/LogoutBtn";
import NavButton from "../Buttons/NavButton";
import Logo from "../Logo/Logo";
import type { NavItem } from "../../../other/types/navigation";

interface HeaderProps {
	navList: NavItem[];
}
const Header = ({ navList } : HeaderProps) => {

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<>
			<header className="flex md:hidden items-center justify-between w-full h-16 px-4 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
				<Logo />
				
				{/* Hamburger / Close Icon Button */}
				<IconButton 
					iconName={isMobileMenuOpen ? "xmark" : "bars"} 
					action={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					btnColor="white"
					iconStyling="text-slate-600 text-lg"
					className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
				/>
			</header>

			{/* Mobile Dropdown / Drawer Overlay */}
			{isMobileMenuOpen && (
				<div 
					className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			<div 
				className={`
					fixed top-16 left-0 right-0 z-200 bg-white border-b border-slate-200 shadow-xl transition-all duration-300 md:hidden overflow-hidden
					${isMobileMenuOpen ? "max-h-[calc(100vh-4rem)] opacity-100 py-4" : "max-h-0 opacity-0 py-0 pointer-events-none"}
				`}
			>
				<div className="flex flex-col h-full px-4 gap-4 max-h-[80vh] overflow-y-auto">
					{/* User profile / Avatar section on mobile */}
					<div className="flex items-center gap-3 pb-3 border-b border-slate-100">
						<Avatar isSidebarOpen={true} />
					</div>

					{/* Navigation Items */}
					<nav className="flex flex-col gap-1">
						{navList.map((navItem, index) => (
							<div 
								key={`mobile-nav-${index}`} 
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<NavButton
									link={navItem.link}
									icon={navItem.icon}
									isSidebarOpen={true}
								>
									{navItem.label}
								</NavButton>
							</div>
						))}
					</nav>

					{/* Logout Button */}
					<div className="pt-3 border-t border-slate-100">
						<LogoutBtn isSidebarOpen={true} />
					</div>
				</div>
			</div>
		</>
	)
}

export default Header;