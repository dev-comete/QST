import type { Dispatch, SetStateAction } from "react";
import type { projectType, userPayload } from "../../../../other/types/userType";
import Box from "../../../atoms/Container/Box";
import CustomText from "../../../atoms/Text/CustomText";
import Input from "../../../atoms/Form/Input";

interface ProjectFormProps {
	listProject: projectType[],
	user?: userPayload,
	setUser: Dispatch<SetStateAction<userPayload>>
}

const ProjetForm = ({ listProject, setUser, user } : ProjectFormProps) => {
	return (
		<Box direction="column" className="max-h-[50%] gap-2">
			<CustomText>Projets assignés</CustomText>
			{
				listProject.length === 0
				? <CustomText 
					className="border border-background p-2"
					textTag="h5"
					isItalic
					>Il n'y a aucun projet, veuillez en créer</CustomText>
				: <Box direction="column" className="overflow-y-auto border border-background p-2">
				{
					listProject.map((proj) => {
						return (
							<Box className="justify-star w-fit">
								<Input
									id={`check + ${proj.id}`}
									name={`check + ${proj.nom}`}
									type="checkbox"
									checked={user && user.projets?.includes(proj.id)}
									onChange={(e) => {
										const checked = (e.target as HTMLInputElement).checked;
										setUser((prev) => {
											const currentOrgs = (prev.projets ?? []).filter((v): v is number => typeof v === 'number' && !isNaN(v));
											if (checked) {
												if (!currentOrgs.includes(proj.id)) {
													return { ...prev, projets: [...currentOrgs, proj.id] };
												}
												return prev;
											} else {
												return { ...prev, projets: currentOrgs.filter((item) => item !== proj.id) };
											}
										});
									}}
									className="cursor-pointer h-4 w-4 rounded"
								/>
								<CustomText>{proj.nom}</CustomText>
							</Box>
						)
					})
				}
			</Box>
			}
		</Box>
	)
}

export default ProjetForm;