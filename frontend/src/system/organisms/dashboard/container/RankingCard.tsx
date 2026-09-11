import Box from "../../../atoms/Container/Box"
import Paper from "../../../atoms/Container/Paper"
import FAIcon from "../../../atoms/Icon/FAIcon"
import CustomText from "../../../atoms/Text/CustomText"
import { UserNameAvatar } from "../../../molecules/Avatar/Avatar"

interface RankingCardProps {
	variant?: string
	students: string[]
}

const RankingCardItem = ({ student } : { student : string }) => {
	return (
		<Box className="border border-background p-3 rounded-xl w-full items-center">
			<UserNameAvatar name={student}/>
			<CustomText >{student}</CustomText>
		</Box>
	)
}

const RankingCard = ({ students, variant = 'top' } : RankingCardProps) => {

	const title = variant == 'top' ? 'Top étudiants' : 'Etudiants en difficulté'

	const icon = variant == 'top' ? 'trophy' : 'ranking-star'

	const staticStudents = ['John Doe', 'Becky Anderson', 'Rakoto rabe']

	return (
			<Paper className="flex flex-col space-y-2 items-center px-3 py-2 flex-1 min-w-0 min-h-30 w-full">
				<Box className="border-b border-background p-3 w-full justify-center">
					<FAIcon name={icon}/>
					<CustomText textTag="h6" >{title}</CustomText>
				</Box>
				<Box direction="column" className="items-center justify-center w-full">
					{
						staticStudents.length == 0 
						? <CustomText textTag="h6" isItalic>Classement indisponible</CustomText>
						: staticStudents.map(( stud, index) => <RankingCardItem key={variant + index} student={stud}/>)
					}
				</Box>
			</Paper>
	)
}

export default RankingCard;