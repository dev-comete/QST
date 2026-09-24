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

    // [ALTERED CODE]: Added ! to ensure these override the Button atom's default styles
    const activeStyle = '!bg-white !shadow-sm ring-1 ring-slate-900/5';
    const inactiveStyle = 'hover:!bg-slate-200/50 text-slate-500 hover:text-slate-700';

    return (
        <Button
            onClick={onClick}
            color="transparent" // Prevents Button's default primary background
            isRounded={false}   // Allows us to apply rounded-lg instead
            // [ALTERED CODE]: flex-1 ensures tabs are equal width. !px-6 !py-2.5 overrides Button's default w-fit and padding
            className={`flex-1 flex justify-center items-center transition-all duration-300 ease-in-out !rounded-lg !px-6 !py-2.5 ${isClicked ? activeStyle : inactiveStyle}`}
        >
            <CustomText 
                weight={isClicked ? 'bold' : 'normal'} 
                textTag="p" 
                color={isClicked ? 'primary' : 'disabled'}
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
        <Box direction="column" className="space-y-6 w-full">
            <Paper className='flex w-full md:w-fit !bg-slate-100/80 !p-1.5 !rounded-xl !border !border-slate-200/50 !shadow-none'>
                {
                    titles.map((value, i) => {
                        return (
                            <NavigationBarButton
                                key={'nav' + i + value}
                                title={value}
                                isClicked={i === activeTab}
                                onClick={() => onTabChange(i)}
                            />
                        )
                    })
                }
            </Paper>
            <Box direction="column" className="w-full animation-fade-in">
                {currentPage}
            </Box>
        </Box>
    )
}

export default NavigationBar;