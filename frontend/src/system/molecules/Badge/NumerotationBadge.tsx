import CustomText from "../../atoms/Text/CustomText";

const NumerotationBadge = ({ index } : { index : string | number }) => {
	return (
		<CustomText
			textTag="span"
			color="white"
			weight="bold"
			className="inline-flex h-8 w-8 min-w-8 items-center justify-center rounded-full bg-primary/80 text-sm shadow-sm shrink-0"
		>
			{index}
		</CustomText>
	)
}

export default NumerotationBadge;