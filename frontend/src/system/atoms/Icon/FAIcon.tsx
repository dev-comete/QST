import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library, type IconName } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

interface FAIconProps {
	name: string
	className?: string
}

const FAIcon = ({ name, className } : FAIconProps) => (
	<FontAwesomeIcon icon={['fas', name as IconName]} className={className} />
)

export default FAIcon