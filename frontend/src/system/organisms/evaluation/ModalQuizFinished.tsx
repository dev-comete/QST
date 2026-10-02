import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Modal } from "../../molecules/Modal/Modal";

interface ModalQuizFinishedProps {
    open: boolean;
    closeModal: () => void;
    id: string;
    onViewResults?: () => void;
}

const ModalQuizFinished = ({ open, closeModal, onViewResults }: ModalQuizFinishedProps) => {
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
        closeModal();
    };

    return (
        <Modal
            title="Quiz terminé !"
            isOpen={open}
            closeModal={closeModal}
        >
            <div className="flex flex-col items-center text-center p-4 space-y-6">
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Félicitations !
                    </h3>
                    <p className="text-sm text-gray-600">
                        Vous avez terminé le quiz. Cliquez sur le bouton ci-dessous pour découvrir votre score et le détail de vos réponses.
                    </p>
                </div>

                <div className="w-full pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="button"
                        onClick={handleViewResults}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-300 transition-colors"
                    >
                        Voir le résultat
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalQuizFinished;