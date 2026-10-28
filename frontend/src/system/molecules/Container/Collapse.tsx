import { useState, type ReactNode } from "react";
import Box from "../../atoms/Container/Box";
import IconButton from "../Buttons/IconButton";
import FAIcon from "../../atoms/Icon/FAIcon";

interface CollapseProps {
	iconTitle?: string
	title: ReactNode
	children?: ReactNode
}

const Collapse = ({ iconTitle, title, children } : CollapseProps ) => {

	const [ show, setShow ] = useState(false)
	return (
		<Box direction="column">
			<div onClick={() => setShow(!show)} className={`cursor-pointer flex justify-between items-center rounded-xl border border-background bg-slate-50 p-3 w-full`}>
				<div className="flex gap-2">
					{iconTitle && <FAIcon name={iconTitle}/>}
					{title}
				</div>
				{
					children &&
					<Box className="items-center">
						<IconButton 
							iconName={ show ? 'chevron-up' : 'chevron-down'}
							action={() => setShow(!show)}
							className="text-disabled"
						/>
					</Box>
				}			
			</div>
			{show && children}
		</Box>
	)
}

export default Collapse;