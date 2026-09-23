import { ROLE_CONFIGS } from "../../../other/types/navigation";
import Layout from "../common/Layout";

const FormateurTemplate = () => {

	return (
		<Layout navList={ROLE_CONFIGS['formateur'].navItem} />
	)
}

export default FormateurTemplate;