import BodyLayout from '../../../layout/common/BodyLayout';
import Box from '../../../../system/atoms/Container/Box';
import Loading from '../../../../system/atoms/Loading/Loading';
import FetchError from '../../../../system/atoms/Loading/FetchError';
import NavigationBar from '../../../../system/molecules/Navigation/NavigationBar';
import FormationList from '../../../../system/organisms/globalParam/FormationList';
import { useFormation } from '../../../../other/hooks/formation/useFormation';
import BaremeList from '../../../../system/organisms/globalParam/BaremeList';
import { useBareme } from '../../../../other/hooks/bareme/useBareme';
import ActionButton from '../../../../system/molecules/Buttons/ActionButton';
import Input from '../../../../system/atoms/Form/Input';
import type { ReactNode } from 'react';

const GlobalItem = ({ disabled, onChange, onClick, children, name, type = 'text', min, max, step, value } : {
	name: string,
	disabled: boolean,
	type?: 'text' |'number';
	min?: string | number,
	max?: string | number,
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
	onClick: () => void,
	children: ReactNode,
	step?: number
	value: number | string | undefined
}) => {

	return (
		<Box direction='column'>
			<Box className='w-full'>
				<Box className='w-1/3'>
					<Input
						id={name}
						name={name}
						type={type}
						onChange={onChange}
						min={min}
						max={max}
						step={step}
						value={value}
					/>
				</Box>
				<ActionButton
					action={onClick}
					disabled={disabled}
				>+ Ajouter</ActionButton>
			</Box>
			{children}
		</Box>
	)
}

export default function GlobalParam() {
	const { formations, formationsStatus, formationInput, setFormationInput, handleCreateFormation } = useFormation()
	const { baremeQuery, baremeInput, setBaremeInput, handleCreateBareme } = useBareme()
	const { data: baremes, status: baremesStatus } = baremeQuery

	if (formationsStatus == 'pending' || baremesStatus == 'pending')
		return <Loading />
	
	if (!formations || !baremes)
		return <FetchError />

	return (
		<BodyLayout
			title={"Paramètres généraux"}
		>
			<Box direction='column' className='space-y-5'>
				<NavigationBar 
					titles={['Formation', 'Barème de question']}
				>
					<GlobalItem
						onChange={(e) => { setFormationInput(e.target.value)}}
						onClick={handleCreateFormation}
						name='formation'
						disabled={formationInput.trim().length == 0}
						value={formationInput}
					>
						<FormationList formations={formations} />
					</GlobalItem>
					<GlobalItem
						onChange={(e) => { 
							const val = e.target.value;
							setBaremeInput(val === '' ? undefined : Number(val));
						}}
						onClick={handleCreateBareme}
						name='bareme'
						disabled={baremeInput === undefined}
						type='number'
						min={0}
						max={100}
						step={0.25}
						value={baremeInput ?? ''}
					>
						<BaremeList baremes={baremes} />
					</GlobalItem>
				</NavigationBar>
			</Box>
		</BodyLayout>
	)
}
