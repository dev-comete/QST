import { Children, type ReactNode } from "react"
import CustomText from "../../atoms/Text/CustomText"
import Box from "../../atoms/Container/Box"
import Paper from "../../atoms/Container/Paper"

interface NavigationButtonProps {
	title : string, 
	isClicked: boolean,
	onClick: () => void
}

const NavigationBarButton = ({ title, isClicked, onClick } : NavigationButtonProps) => {

	const baseStyle = 'flex justify-center w-full cursor-pointer hover:brightness-90 active:brightness-75 rounded-lg p-3'

	return (
		<div
			onClick={onClick}
			className={`${baseStyle} ${isClicked ? 'bg-secondary shadow-md' : ''}`}
		>
			<CustomText weight='bold' textTag="h3" color={`${isClicked ? 'primary' : 'disabled'}`}>{title}</CustomText>
		</div>
	)
}

interface NavigationBarProps {
	titles: string[],
	children: ReactNode,
	activeTab: number,
    onTabChange: (index: number) => void
}

const NavigationBar = ({ titles, children , activeTab, onTabChange} : NavigationBarProps ) => {

	//const [ idx, setIdx ] = useState(0)

	const pages = Children.toArray(children);

	//const currentPage = pages[idx] ?? pages[0] ?? null;
	const currentPage = pages[activeTab] ?? pages[0] ?? null;

	return (
		<Box direction="column" className="space-y-3">
			<Paper className='flex w-full justify-between'>
				{
					titles.map((value, i) => {
						return (
							<NavigationBarButton
								key={'nav' + i + value}
								title={value}
								//isClicked={i === idx}
								isClicked={i === activeTab}
								//onClick={() => setIdx(i)}
								onClick={() => onTabChange(i)}
							/>
						)
					})
				}
			</Paper>
			{currentPage}
		</Box>
	)
}

export default NavigationBar