import { useNavigate } from "react-router";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";


/*			Temporary Home */

const Home = () => {

	const navigate = useNavigate()

    return (
        <div className="flex gap-3 items-center justify-center h-screen">
			<ActionButton action={() => navigate("/admin") }>{"Admin"}</ActionButton>
			<ActionButton action={() => navigate("/formateur") }>{"Formateur"}</ActionButton>
			<ActionButton action={() => navigate("/apprenant") }>{"Apprenant"}</ActionButton>
		</div>
    )
}

export default Home;