import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Modal } from "../../molecules/Modal/Modal";
import ActionButton from "../../molecules/Buttons/ActionButton";
// import { PercentageRing } from "../../molecules/Display/PercentRing";
import CustomText from "../../atoms/Text/CustomText";
import Box from "../../atoms/Container/Box";

interface ModalQuizFinishedProps {
    open: boolean;
    scoreQuiz: number;
    onViewResults?: () => void;
}

const ModalQuizFinished = ({ open, onViewResults, scoreQuiz }: ModalQuizFinishedProps) => {
    useEffect(() => {
        if (open) {
            // Trigger confetti burst
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999, // Ensures confetti displays over the modal
            });
        }
    }, [open]);

    const handleViewResults = () => {
        if (onViewResults) {
            onViewResults();
        }
    };

    return (
        <Modal
            title="Quiz terminé"
            isOpen={open}
			footer={
				<ActionButton onClick={handleViewResults}>Voir les bulletins</ActionButton>
			}
        >
			<Box direction="column" className="space-y-2 items-center w-full">
				{/* <PercentageRing
					score={scoreQuiz}
					size={100}
				/> */}
				<CustomText textTag="h3">
					Félicitations !
				</CustomText>
				<CustomText textTag="h3">
					Vous avez obtenu {scoreQuiz} points au quiz.
				</CustomText>
			</Box>
        </Modal>
    );
};

export default ModalQuizFinished;