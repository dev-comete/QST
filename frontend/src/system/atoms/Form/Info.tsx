import Box from "../Container/Box";
import FAIcon from "../Icon/FAIcon";
import CustomText from "../Text/CustomText";

interface InfoProps {
	info: string,
	variant?: 'info' | 'alert' | 'error'
}

const Info = ({ info, variant = 'info' } : InfoProps) => {

	const styling = variant == 'info' ? 'border border-background' : 'border-error bg-error-light'
	return (
		<Box className={`overflow-y-auto p-2 w-full border rounded-xl justify-center ${styling}`}>
			{ variant == 'error' && <FAIcon name="triangle-exclamation" className="text-error"/>}
			<CustomText textTag="h5">
				{info}
			</CustomText>
		</Box>
	)
}

export default Info;