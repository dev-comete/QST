import { useAuth } from "../../../other/hooks/auth/useAuth"
import Box from "../../atoms/Container/Box"
import CustomText from "../../atoms/Text/CustomText"

const Avatar = () => {
    const { authUser } = useAuth()

    const role = authUser?.role ?? 'Apprenant'
    const username = authUser?.username ?? 'JohnDoe'

    return (
        <Box className="rounded-xl p-5 bg-background w-fit items-center">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center p-2">
                {role.charAt(0).toUpperCase()}
            </div>
            <CustomText textTag="h5">{username}</CustomText>
        </Box>
    )
}

export default Avatar