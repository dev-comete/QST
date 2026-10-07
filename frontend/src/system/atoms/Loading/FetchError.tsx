import ErrorPage from "../../../product/pages/common/ErrorPage";

const FetchError = () => {

	const msg = "Une erreur de téléchargement s'est produite."

	return (
		<ErrorPage msg={msg} info="Veuillez réessayer plus tard"/>
	)
}

export default FetchError;