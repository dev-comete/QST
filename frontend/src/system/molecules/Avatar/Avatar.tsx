import { useAuth } from "../../../other/hooks/auth/useAuth"
import Box from "../../atoms/Container/Box"
import CustomText from "../../atoms/Text/CustomText"

export const UserNameAvatar = ({ name } : { name: string}) => {

    return (
		<div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center p-2">
			{name.charAt(0).toUpperCase()}
		</div>
    )
}

const Avatar = () => {
    const { authUser } = useAuth()

    const role = authUser?.role ?? 'Apprenant'
    const username = authUser?.username ?? 'JohnDoe'

    return (
        <Box className="rounded-xl p-5 border border-background w-3/4 items-center">
            <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center p-2">
                {role.charAt(0).toUpperCase()}
            </div>
            <CustomText textTag="h5" weight="bold" className="capitalize">{username}</CustomText>
        </Box>
    )
}

export default Avatar