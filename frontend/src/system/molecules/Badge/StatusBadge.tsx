import Box from "../../atoms/Container/Box"

interface StatusBadgeProps {
	value: string
}

const StatusBadge = ({ value } : StatusBadgeProps) => {

	let color

	switch(value) {
		case 'Terminé' :
			color = 'bg-success-light text-success'
			break
		case 'En cours' :
			color = 'bg-warning-light text-warning'
			break
		default:
			color = 'bg-disabled-light text-disabled'
	}

	return (
		<Box className={` rounded-xl ${color} px-2 py-1 w-fit`}>{value}</Box>
	)
}

export default StatusBadge;