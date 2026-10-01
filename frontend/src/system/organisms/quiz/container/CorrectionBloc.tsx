import { useEffect } from "react";
import type { Correction } from "../../../../other/types/quizType";
import Box from "../../../atoms/Container/Box";
import Paper from "../../../atoms/Container/Paper";
import Input from "../../../atoms/Form/Input";
import FAIcon from "../../../atoms/Icon/FAIcon";
import CustomText from "../../../atoms/Text/CustomText";
import NumerotationBadge from "../../../molecules/Badge/NumerotationBadge";

interface CorrectionItemProps {
	id: number,
	item : Correction,
}

const CorrectionItem = ({ item } : CorrectionItemProps) => {

	return (
		<Box direction="column" className="space-y-3 items-start">
			{
				item.options.map((opt, index) => {

					return (
						<Box
							direction="column"
							className="w-full"
							key={`${opt.reponse_id}-${index}`}
						>
							<Box
								className={`
									justify-start rounded-lg px-3 py-5 items-center border
									${opt.est_correct ? 'bg-success-light border-success' :
										opt.choisi_par_apprenant ? 'bg-error-light border-error' : 'border-background'
									}	
								`}
							>
								<Box>
									<Input
										type={'checkbox'}
										id={`q-${item.question_id}-opt-${opt.reponse_id}`}
										name={`correction_${item.question_id}`}
										checked={opt.choisi_par_apprenant}
										readOnly={true}
									/>
								</Box>
								<CustomText color={opt.est_correct ? 'success' : 'text'}>{opt.texte}</CustomText>
								<FAIcon
									name={opt.est_correct ? 'circle-check' : opt.choisi_par_apprenant ? 'circle-xmark' : ''}
									className={opt.est_correct ? 'text-success' : 'text-error'}
								/>
							</Box>
							{
								opt.explication &&
								<Box
									className={`
										justify-start items-center rounded-xl px-3 py-5 bg-background pl-5
									`}
								>
									<FAIcon name="lightbulb" className="text-warning"/>
									<CustomText color="primary" isItalic>Explication : {opt.explication}</CustomText>
								</Box>
							}
						</Box>
					)
				})
			}
		</Box>
	)
}

interface QuizReviewBlocProps {
	corrections: Correction[],
	activeIndex?: number,
	onSelectQuestion?: (index: number) => void,
}

export const CorrectionBlocNav = ({ corrections, activeIndex = 0, onSelectQuestion } : QuizReviewBlocProps) => {
	
	return (
		<Paper className="p-5 overflow-y-auto flex flex-col item-center">
			<CustomText
				textTag='h4'
				weight='bold'
				color='primary'
				className='uppercase text-center border-b border-background pb-2 mb-5'
			>Liste des questions</CustomText>
			<Box direction="column" className="overflow-y-auto w-full gap-2">
				{ corrections.map((item, index) => {
					const isSelected = activeIndex === index;
					return (
						<button
							type="button"
							onClick={() => onSelectQuestion?.(index)}
							key={'blocNav' + index}
							className={`
								w-full flex justify-between items-center gap-2 rounded-lg px-2 py-2 text-left cursor-pointer transition-colors
								${isSelected ? 'bg-accent' : 'hover:bg-background'}
							`}
						>
							<CustomText className="flex-1">{index + 1}. {item.enonce}</CustomText>
							{
								item.vrai_ou_faux
								? <FAIcon name="circle-check" className="text-success"/> 
								: <FAIcon name="circle-xmark" className="text-error"/>
							}
						</button>
					)
				})}
			</Box>
		</Paper>
	)
}

const CorrectionBloc = ({ corrections, activeIndex = 0 } : QuizReviewBlocProps) => {

	useEffect(() => {
		if (typeof activeIndex !== 'number') return;

		const questionElement = document.getElementById(`correction-question-${activeIndex}`);
		if (questionElement) {
			questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [activeIndex, corrections.length]);

	return (
		<Box direction="column" className="space-y-5 overflow-y-auto w-full">
			{
				corrections.map((item, index) => {
					return (
						<div id={`correction-question-${index}`}>
							<Paper
								className='p-5'
								key={`ibloc-${item.question_id}-${index}`}
							>
								<Box direction="column" className="space-y-5"> 
									<Box className="justify-between border-b border-background pb-2">
										<Box className="items-center space-x-2">
											<NumerotationBadge index={index + 1}/>
											<CustomText
												textTag="h2"
												weight="bold"
											>{item.enonce}</CustomText>
										</Box>
										<CustomText
											textTag="h6"
											weight="bold"
											className={`
												${item.points_obtenus == 0 ? 'bg-error' : 'bg-success'}
												px-2 py-1 rounded-md
												text-white
											`}
										>{item.points_obtenus} pts</CustomText>
									</Box>
									<CorrectionItem
										id={item.question_id}
										item={item}
									/>
								</Box>
							</Paper>
						</div>
					)
				})
			}
		</Box>
	)
}

export default CorrectionBloc;