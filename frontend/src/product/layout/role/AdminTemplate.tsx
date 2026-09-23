import { ROLE_CONFIGS } from "../../../other/types/navigation";
import Layout from "../common/Layout";

const AdminTemplate = () => {

	return (
		<Layout navList={ROLE_CONFIGS['admin'].navItem} />
	)
}

export default AdminTemplate;