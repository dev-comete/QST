import { useNavigate } from "react-router";
import { useAuth } from "../../../other/hooks/auth/useAuth";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";

interface AvatarProps {
    isSidebarOpen?: boolean;
}

export const UserNameAvatar = ({ name }: { name: string }) => {
    const initial = typeof name === 'string' && name.trim().length > 0 
        ? name.charAt(0).toUpperCase() 
        : '?';

    return (
        <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center p-2 flex-shrink-0 font-bold">
            {initial}
        </div>
    );
};

const Avatar = ({ isSidebarOpen = true }: AvatarProps) => {
    const { authUser } = useAuth();
    const navigate = useNavigate();

    const role = authUser?.role ?? 'Apprenant';
    const username = authUser?.username ?? 'JohnDoe';
    const email = authUser?.email ?? 'default@mail.qst';

    return (
        <button
            type="button"
            onClick={() => navigate('/profile/me')}
            className="w-full text-left bg-transparent border-0 p-0 m-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
            aria-label="Voir mon profil"
        >
            <Box 
                direction="row" 
                className={`rounded-xl border border-background items-center transition-all duration-300 ease-in-out ${
                    isSidebarOpen 
                        ? 'w-11/12 p-3 gap-3 justify-start hover:bg-slate-50' 
                        : 'w-auto p-1.5 justify-center border-transparent bg-transparent hover:bg-slate-50/60'
                }`}
            >
                {/* Avatar Badge */}
                <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center flex-shrink-0 font-bold shadow-sm leading-none">
                    {role.charAt(0).toUpperCase()}
                </div>

                {/* User Info Block */}
                <div 
                    className={`flex flex-col items-start justify-center text-left leading-tight transition-all duration-300 ease-in-out overflow-hidden min-w-0 ${
                        isSidebarOpen ? 'max-w-[170px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                >
                    <CustomText 
                        textTag="p" 
                        weight="bold" 
                        color="text" 
                        className="capitalize truncate w-full text-sm leading-snug"
                    >
                        {username}
                    </CustomText>
                    
                    <CustomText 
                        textTag="h6" 
                        color="disabled" 
                        className="truncate w-full text-xs mt-0.5"
                    >
                        {role}
                    </CustomText>
                    
                    <CustomText 
                        textTag="h6" 
                        color="disabled" 
                        className="lowercase truncate w-full text-[11px] opacity-75 mt-0.5"
                    >
                        {email}
                    </CustomText>
                </div>
            </Box>
        </button>
    );
};

export default Avatar;