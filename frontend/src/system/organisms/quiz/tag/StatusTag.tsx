import CustomText from "../../../atoms/Text/CustomText";
import type { Role, ColorTheme } from "../../../../other/types/common";

export const QuizStatusTag = ({ status }: { status: string }) => {
    
    const isDraft = status === 'draft';
    
    // Draft gets a neutral/disabled styling, Published gets success styling
    const bgStyle = isDraft 
        ? 'bg-disabled/10 border border-disabled/20' 
        : 'bg-success/10 border border-success/20';
        
    const textColor: ColorTheme = isDraft ? 'disabled' : 'success';
    const label = isDraft ? 'Brouillon' : 'Publié';

    return (
        <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full ${bgStyle}`}>
            <CustomText
                weight="bold"
                textTag="caption"
                color={textColor}
                className="tracking-wide"
            >
                {label}
            </CustomText>
        </div>
    );
};

export const StatusTag = ({ status }: { status: string }) => {
    
    const isActive = status === 'Actif';
    
    // Actif gets success styling, anything else gets error styling
    const bgStyle = isActive 
        ? 'bg-success/10 border border-success/20' 
        : 'bg-error/10 border border-error/20';
        
    const textColor: ColorTheme = isActive ? 'success' : 'error';

    return (
        <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full ${bgStyle}`}>
            <CustomText
                weight="bold"
                textTag="caption"
                color={textColor}
                className="capitalize tracking-wide"
            >
                {status}
            </CustomText>
        </div>
    );
};

export const UserRoleTag = ({ role }: { role: Role | string }) => {
    
    let bgStyle = '';
    let textColor: ColorTheme = 'text';

    switch (role) {
        case 'admin':
            bgStyle = 'bg-error/10 border border-error/20';
            textColor = 'error';
            break;
        case 'formateur':
            bgStyle = 'bg-success/10 border border-success/20';
            textColor = 'success';
            break;
        case 'apprenant':
            bgStyle = 'bg-primary/10 border border-primary/20';
            textColor = 'primary';
            break;
        case 'rfq':
            bgStyle = 'bg-warning/10 border border-warning/20';
            textColor = 'warning';
            break;
        default:
            bgStyle = 'bg-accent/10 border border-accent/20';
            textColor = 'accent';
            break;
    }

    return (
        <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full ${bgStyle}`}>
            <CustomText
                weight="bold"
                textTag="caption"
                color={textColor}
                className="capitalize tracking-wide"
            >
                {role}
            </CustomText>
        </div>
    );
};