import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library, type IconName, type SizeProp } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

interface FAIconProps {
    name: string
    className?: string
    size?: SizeProp
}

const FAIcon = ({ name, className, size }: FAIconProps) => (
    <FontAwesomeIcon icon={['fas', name as IconName]} className={className} size={size} />
)

export default FAIcon