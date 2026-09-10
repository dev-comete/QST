import type { Dispatch, SetStateAction } from "react";
import type { organisationType, userPayload } from "../../../../other/types/userType";
import Box from "../../../atoms/Container/Box";
import CustomText from "../../../atoms/Text/CustomText";
import Input from "../../../atoms/Form/Input";

interface OrganisationFormProps {
	listOrganisation: organisationType[],
	user?: userPayload,
	setUser: Dispatch<SetStateAction<userPayload>>
}

const OrganisationForm = ({ listOrganisation, setUser, user } : OrganisationFormProps) => {
	return (
		<Box direction="column" className="max-h-[50%] gap-2">
			<CustomText>Organisations assignées</CustomText>
			{
				listOrganisation.length === 0
				? <CustomText 
					className="border border-background p-2"
					textTag="h5"
					isItalic
					>Il n'y a aucune organisation, veuillez en créer</CustomText>
				: <Box direction="column" className="overflow-y-auto border border-background p-2">
				{
					listOrganisation.map((org) => {
						return (
							<Box className="justify-star w-fit">
								<Input
									id={`check + ${org.id}`}
									name={`check + ${org.nom}`}
									type="checkbox"
									checked={user && user.organisation?.includes(org.id)}
									onChange={(e) => {
										const checked = (e.target as HTMLInputElement).checked;
										setUser((prev) => {
											const currentOrgs = (prev.organisation ?? []).filter((v): v is number => typeof v === 'number' && !isNaN(v));
											if (checked) {
												if (!currentOrgs.includes(org.id)) {
													return { ...prev, organisation: [...currentOrgs, org.id] };
												}
												return prev;
											} else {
												return { ...prev, organisation: currentOrgs.filter((item) => item !== org.id) };
											}
										});
									}}
									className="cursor-pointer h-4 w-4 rounded"
								/>
								<CustomText>{org.nom}</CustomText>
							</Box>
						)
					})
				}
			</Box>
			}
		</Box>
	)
}

export default OrganisationForm;