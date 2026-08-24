import type { NavItem } from "../../../other/types/common";
import SideBar from "./SideBar";
import { Outlet } from "react-router";

interface LayoutProps {
	navList: NavItem[]
}

const Layout = ({ navList } : LayoutProps ) => {
	return (
		<div className="flex justify-between gap-2 h-[100vh] w-full">
			<SideBar navList={navList}/>
			<main className="flex-3 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	)
}

export default Layout;