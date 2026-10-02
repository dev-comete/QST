import QuestionList from "../../../../system/organisms/question/list/QuestionList";
import BodyLayout from "../../../layout/common/BodyLayout";

const QuestionBin = () => {

    return (
        <BodyLayout
			title={"Corbeille de questions"}
			defaultLinkBack
		>
			<QuestionList listType="trash"/>
		</BodyLayout>
    )
}

export default QuestionBin;