import type { NavItem } from "../../../other/types/navigation";
import Header from "../../../system/molecules/LayoutElement/Header";
import SideBar from "./SideBar";
import { Outlet } from "react-router";
import NotificationBell from "../../../system/organisms/notification/NotificationBell";

interface LayoutProps {
	navList: NavItem[]
}

const Layout = ({ navList } : LayoutProps ) => {
	return (
		<div className="flex flex-col md:flex-row justify-between gap-2 h-screen w-full">
			<Header navList={navList}/>
			<SideBar navList={navList}/>
			<main className="flex-1 overflow-y-auto">
				<div className="hidden md:flex justify-end items-center h-12 px-6 relative z-50">
					<div className="-translate-y-[1px] relative z-[60] top-5 right-5">
						<NotificationBell />
					</div>
				</div>
				<Outlet />
			</main>
		</div>
	)
}

export default Layout;