import { useNavigate } from "react-router";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";


/*			Temporary Home */

const Home = () => {

	const navigate = useNavigate()

    return (
        <div className="flex gap-3 items-center justify-center h-screen">
			<ActionButton btnColor="primary" textColor="white" action={() => navigate("/admin") }>{"Admin"}</ActionButton>
			<ActionButton btnColor="primary" textColor="white" action={() => navigate("/formateur") }>{"Formateur"}</ActionButton>
			<ActionButton btnColor="primary" textColor="white" action={() => navigate("/apprenant") }>{"Apprenant"}</ActionButton>
			<ActionButton btnColor="primary" textColor="white" action={() => navigate("/test") }>{"Test"}</ActionButton>
		</div>
    )
}

export default Home;