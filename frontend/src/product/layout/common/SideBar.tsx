import { useState } from "react";
import type { NavItem } from "../../../other/types/navigation";
import Avatar from "../../../system/molecules/Avatar/Avatar";
import LogoutBtn from "../../../system/molecules/Buttons/LogoutBtn";
import NavButton from "../../../system/molecules/Buttons/NavButton";
import Logo from "../../../system/molecules/Logo/Logo";
import IconButton from "../../../system/molecules/Buttons/IconButton";
import Box from "../../../system/atoms/Container/Box"; 

interface SideBarProps {
    navList : NavItem[],
}

const SideBar = ({ navList } : SideBarProps ) => {

    // [NEW CODE ADDED]: State to control whether the sidebar is expanded or collapsed
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
       
        <div className={`flex flex-col ${isSidebarOpen ? 'w-[280px]' : 'w-[88px]'} shrink-0 bg-white min-h-screen border-r border-slate-100 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] pt-6 transition-all duration-300 relative overflow-x-visible`}>
            
            <div className="absolute -right-3 top-8 z-50">
                <IconButton 
                    iconName={isSidebarOpen ? "chevron-left" : "chevron-right"} 
                    action={() => setIsSidebarOpen(!isSidebarOpen)}
                    btnColor="white"
                    iconStyling="text-slate-400 hover:text-primary transition-colors text-[10px]"
                    className="!p-1.5 border border-slate-200 shadow-sm !rounded-full hover:!bg-slate-50 transition-all bg-white"
                />
            </div>

            <div className="flex flex-col items-center flex-none w-full gap-5 pb-6 border-b border-slate-50 overflow-hidden">
              
                <Box direction="column" className={`items-center transition-all duration-300 ${isSidebarOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-70'}`}>
                    <Logo />
                    <Avatar isSidebarOpen={isSidebarOpen}/>
                </Box>
            </div>
            
           
            <nav className="flex flex-col flex-1 w-full px-4 mt-6 overflow-y-auto overflow-x-hidden gap-2 custom-scrollbar">
            {
                navList.map((navItem, index) => {
                    const { label, link, icon } = navItem
                    return (
                        <NavButton
                            key={`Label + ${index}`}
                            link={link}
                            icon={icon}
                            isSidebarOpen={isSidebarOpen} 
                        >
                            {label}
                        </NavButton>
                    )
                })
            }
            </nav>
            
            <div className="flex-none w-full mt-auto p-4 border-t border-slate-50 flex justify-center overflow-hidden">
                <Box className={`transition-all duration-300 ${isSidebarOpen ? 'scale-100' : 'scale-75'}`}>
                    <LogoutBtn isSidebarOpen={isSidebarOpen}/>
                </Box>
            </div>
        </div>
    )
}

export default SideBar;