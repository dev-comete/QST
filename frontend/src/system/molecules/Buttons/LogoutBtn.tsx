import { useLogout } from "../../../other/hooks/auth/useAuth";
import FAIcon from "../../atoms/Icon/FAIcon";
import ActionButton from "./ActionButton";

interface LogoutBtnProps {
    isSidebarOpen?: boolean;
}

const LogoutBtn = ({ isSidebarOpen = true }: LogoutBtnProps) => {
    const logout = useLogout();

    return (
        <ActionButton
            onClick={logout}
            btnColor="primary"
            title="Déconnexion"
            // [ALTERED CODE]: Removes padding and forces perfect flex centering when collapsed
            className={`!transition-all !duration-300 !ease-in-out ${
                isSidebarOpen 
                    ? '!w-full !px-4 !py-2.5' 
                    : '!w-10 !h-10 !p-0 !rounded-full !flex !items-center !justify-center'
            }`}
        >
            <div className={`flex items-center justify-center w-full h-full ${isSidebarOpen ? 'gap-2' : ''}`}>
                <FAIcon 
                    name="power-off" 
                    className="flex-shrink-0 leading-none text-center" 
                />
                
                {/* [NEW CODE ADDED]: Smoothly collapsing text label */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                    isSidebarOpen ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0'
                }`}>
                    <span>Déconnexion</span>
                </div>
            </div>
        </ActionButton>
    );
};

export default LogoutBtn;