import type { NavItem } from "../../../other/types/common";
import Header from "../../../system/molecules/LayoutElement/Header";
import SideBar from "./SideBar";
import { Outlet } from "react-router";

interface LayoutProps {
	navList: NavItem[]
}

const Layout = ({ navList } : LayoutProps ) => {
	return (
		<div className="flex flex-col">
			<Header />
			<div className="flex justify-between gap-2">
				<SideBar navList={navList}/>
				<main className="flex-[3]">
					<Outlet />
				</main>
			</div>
		</div>
	)
}

export default Layout;