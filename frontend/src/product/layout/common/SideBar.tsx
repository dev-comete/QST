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
        // [ALTERED CODE]: Changed w-64 to w-[280px] to accommodate longer French labels, and added shrink-0
        // OLD: <div className="flex flex-col w-64 bg-white min-h-screen border-r border-slate-100 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] pt-6 transition-all">
        <div className="flex flex-col w-[280px] shrink-0 bg-white min-h-screen border-r border-slate-100 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] pt-6 transition-all">

            {/* [OLD CODE DELETED]: Removed previous header styling
            <div className="flex flex-col items-center flex-none w-full space-y-5 pb-5 pt-5">
                <Logo />
                <Avatar />
            </div> 
            */}
            <div className="flex flex-col items-center flex-none w-full gap-5 pb-6 border-b border-slate-50">
                <Logo />
                <Avatar />
            </div>
            
            {/* [OLD CODE DELETED]: Removed arbitrary pl-5 and space-y-1 
            <nav className="flex flex-col flex-1 w-full pl-5 overflow-y-auto space-y-1"> 
            */}
            <nav className="flex flex-col flex-1 w-full px-4 mt-6 overflow-y-auto gap-2 custom-scrollbar">
            {
                navList.map((navItem, index) => {
                    const { label, link, icon } = navItem
                    return (
                        <NavButton
                            key={`Label + ${index}`}
                            link={link}
                            icon={icon}
                            // [OLD CODE DELETED]: Removed fixed py-5. NavButton now controls its own padding.
                            // className="w-full py-5"
                        >
                            {label}
                        </NavButton>
                    )
                })
            }
            </nav>
            
            {/* [OLD CODE DELETED]: Removed previous footer styling 
            <div className="flex-none w-full mt-auto p-5 flex justify-center">
                <LogoutBtn />
            </div> 
            */}
            <div className="flex-none w-full mt-auto p-4 border-t border-slate-50 flex justify-center">
                <LogoutBtn />
            </div>
        </div>
    )
}

export default SideBar;