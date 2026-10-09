import type { NavItem } from "../../../other/types/navigation";
import Header from "../../../system/molecules/LayoutElement/Header";
import SideBar from "./SideBar";
import { Outlet } from "react-router";

interface LayoutProps {
	navList: NavItem[]
}

const Layout = ({ navList } : LayoutProps ) => {
	return (
		<div className="flex flex-col md:flex-row justify-between gap-2 h-screen w-full">
			<Header navList={navList}/>
			<SideBar navList={navList}/>
			<main className="flex-1 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	)
}

export default Layout;