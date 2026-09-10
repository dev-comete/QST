import Box from "../Container/Box";
import CustomText from "../Text/CustomText";

const Info = ({ info } : { info : string }) => {
	return (
		<Box direction="column" className="overflow-y-auto border border-background p-2 w-full">
			<CustomText textTag="h5">
				{info}
			</CustomText>
		</Box>
	)
}

export default Info;