import Box from "../../../atoms/Container/Box"
import Paper from "../../../atoms/Container/Paper"
import FAIcon from "../../../atoms/Icon/FAIcon"
import CustomText from "../../../atoms/Text/CustomText"
import { UserNameAvatar } from "../../../molecules/Avatar/Avatar"
import type { RankedStudent } from "../../../../other/types/vagueType";

interface RankingCardProps {
	variant?: string
	students: RankedStudent[]
}

const RankingCardItem = ({ student } : { student : RankedStudent }) => {
	const displayName = student.utilisateur__username || "Inconnu";
	return (
		<Box className="border border-background p-3 rounded-xl w-full items-center justify-between mt-2">
            <Box className="items-center gap-3">
                {/* On passe bien une STRING à l'avatar */}
                <UserNameAvatar name={displayName}/>
                {/* On passe bien une STRING au texte */}
                <CustomText>{displayName}</CustomText>
            </Box>
            
            {student.score_cumule !== undefined && student.score_cumule !== null && (
                <CustomText weight="bold" className="text-primary text-sm">
                    {student.score_cumule} pts
                </CustomText>
            )}
        </Box>
	)
}

const RankingCard = ({ students, variant = 'top' } : RankingCardProps) => {

	const title = variant == 'top' ? 'Top étudiants' : 'Etudiants en difficulté'

	const icon = variant == 'top' ? 'trophy' : 'ranking-star'

	return (
			<Paper className="flex flex-col space-y-2 items-center px-3 py-2 flex-1 min-w-0 min-h-30 w-full">
				<Box className="border-b border-background p-3 w-full justify-center">
					<FAIcon name={icon}/>
					<CustomText textTag="h6" >{title}</CustomText>
				</Box>
				<Box direction="column" className="items-center justify-center w-full">
					{
						students.length == 0 
						? <CustomText textTag="h6" isItalic>Classement indisponible</CustomText>
						: students.map(( stud, index) => <RankingCardItem key={variant + index} student={stud}/>)
					}
				</Box>
			</Paper>
	)
}

export default RankingCard;