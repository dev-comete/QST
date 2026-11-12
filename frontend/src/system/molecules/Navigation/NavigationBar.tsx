import { Children, type ReactNode } from "react"
import CustomText from "../../atoms/Text/CustomText"
import Box from "../../atoms/Container/Box"
import Paper from "../../atoms/Container/Paper"
import Button from "../../atoms/Button/Button" 

interface NavigationButtonProps {
    title : string, 
    isClicked: boolean,
    onClick: () => void
}

const NavigationBarButton = ({ title, isClicked, onClick } : NavigationButtonProps) => {

    const activeStyle = '!shadow-sm ring-1 ring-slate-900/5';
    const inactiveStyle = 'hover:!bg-slate-200/50 text-slate-500 hover:text-slate-700';

    return (
        <Button
            onClick={onClick}
            // V0: color="transparent"
            color={isClicked ? 'primary' : 'transparent'}
            isRounded={false}
            className={`flex justify-center items-center transition-all duration-300 ease-in-out !rounded-lg !px-6 !py-2.5 ${isClicked ? activeStyle : inactiveStyle}`}
        >
            <CustomText
                weight={isClicked ? 'bold' : 'normal'} 
                textTag="p" 
                // V0  : color={isClicked ? 'white' : 'disabled'}
                color={isClicked ? 'white' : 'disabled'}
                className={`tracking-wide ${isClicked ? '' : 'opacity-80'}`}
            >
                {title}
            </CustomText>
        </Button>
    )
}

interface NavigationBarProps {
    titles: string[],
    children: ReactNode,
    activeTab: number,
    onTabChange: (index: number) => void
}

const NavigationBar = ({ titles, children, activeTab, onTabChange } : NavigationBarProps ) => {

    const pages = Children.toArray(children);
    const currentPage = pages[activeTab] ?? pages[0] ?? null;

    return (
        <Box direction="column" className="w-full min-w-0">
    <div className="sticky top-0 z-50 w-fit max-w-full py-2">
        <Paper className="flex w-full max-w-full overflow-x-auto no-scrollbar [&>*]:shrink-0 [&>*]:whitespace-nowrap !bg-slate-100/80 !p-1.5 !rounded-xl !border !border-slate-200/50 !shadow-none">
            {titles.map((value, i) => (
                <NavigationBarButton
                    key={'nav' + i + value}
                    title={value}
                    isClicked={i === activeTab}
                    onClick={() => onTabChange(i)}
                />
            ))}
        </Paper>
    </div>

    <Box direction="column" className="w-full min-w-0 animation-fade-in">
        {currentPage}
    </Box>
</Box>
    )
}

export default NavigationBar;