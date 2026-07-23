import type { NavItem } from "../../other/types/common";
import SideBar from "./SideBar";
import { Outlet } from "react-router";

interface LayoutProps {
	navList: NavItem[]
}

const Layout = ({ navList } : LayoutProps ) => {
	return (
		<div className="flex justify-between gap-2">
			<SideBar navList={navList}/>
			<div className="flex-3">
				<Outlet />
			</div>
		</div>
	)
}

export default Layout;