import cometeImg from "../../../assets/comete.jpg";

interface LogoProps {
    isSidebarOpen?: boolean; // [NEW CODE ADDED]: Track sidebar state
}

const Logo = ({ isSidebarOpen = true }: LogoProps) => {
    return (
        <div className="flex items-center justify-center transition-all duration-300 ease-in-out">
            <img 
                src={cometeImg} 
                alt="COMETE - QST"
                className={`object-contain transition-all duration-300 ease-in-out ${
                    isSidebarOpen 
                        ? "h-10 w-auto max-w-[180px] rounded-lg" 
                        : "h-9 w-9 rounded-full shadow-sm"
                }`}
            />
        </div>
    );
};

export default Logo;