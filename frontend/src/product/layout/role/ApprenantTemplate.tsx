import { ROLE_CONFIGS } from "../../../other/types/navigation";
import Layout from "../common/Layout";

const ApprenantTemplate = () => {

	return (
		<Layout navList={ROLE_CONFIGS['apprenant'].navItem} />
	)
}

export default ApprenantTemplate;