import Box from "../../atoms/Container/Box"

interface PercentBadgeProps {
	value: number
	lowValue?: number
	highValue?: number
}

const PercentBadge = ({ value, lowValue = 25, highValue = 75 } : PercentBadgeProps) => {

	let color = 'bg-success-light text-success'

	if (value <= lowValue)
		color = 'bg-error-light text-error'
	else if (value > lowValue && value <= highValue)
		color = 'bg-warning-light text-warning'

	return (
		<Box className={` rounded-xl ${color} px-2 py-1 w-fit`}>{value + '%'}</Box>
	)
}

export default PercentBadge;