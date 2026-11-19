import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Modal } from "../../molecules/Modal/Modal";
import ActionButton from "../../molecules/Buttons/ActionButton";
import CustomText from "../../atoms/Text/CustomText";
import Box from "../../atoms/Container/Box";
import FAIcon from "../../atoms/Icon/FAIcon";
import { PercentageRing } from "../../molecules/Display/PercentRing";

interface ModalQuizFinishedProps {
    open: boolean;
    scoreQuiz: number;
    totalScore: number;
    onViewResults?: () => void;
}

const formatScore = (score: number) => Number(score.toFixed(2)).toString();

const ModalQuizFinished = ({
    open,
    onViewResults,
    scoreQuiz,
    totalScore,
}: ModalQuizFinishedProps) => {
    const hasScore = totalScore > 0;
    const percentage = hasScore
        ? Math.min(100, Math.max(0, Math.round((scoreQuiz / totalScore) * 100)))
        : null;
    const didExcel = percentage !== null && percentage >= 80;
    const passed = percentage !== null && percentage >= 50;

    useEffect(() => {
        if (!open || !didExcel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        confetti({
            particleCount: 90,
            spread: 65,
            origin: { y: 0.6 },
            zIndex: 9999,
        });
    }, [didExcel, open]);

    const result = percentage === null
        ? {
            icon: "circle-check",
            iconStyle: "bg-primary/10 text-primary",
            title: "Quiz enregistré !",
            message: "Votre travail a bien été pris en compte. Consultez le corrigé pour découvrir votre résultat.",
        }
        : didExcel
        ? {
            icon: "trophy",
            iconStyle: "bg-success-light text-success",
            title: "Excellent travail !",
            message: "Votre préparation a porté ses fruits. Continuez sur cette lancée !",
        }
        : passed
            ? {
                icon: "circle-check",
                iconStyle: "bg-primary/10 text-primary",
                title: "Belle progression !",
                message: "Vous avez validé une bonne partie du quiz. Chaque effort compte !",
            }
            : {
                icon: "book-open",
                iconStyle: "bg-warning-light text-warning",
                title: "Une étape de plus !",
                message: "Chaque quiz est une occasion d’apprendre. Consultez le corrigé pour progresser.",
            };

    return (
        <Modal
            title="Quiz terminé"
            isOpen={open}
            footer={
                <ActionButton onClick={() => onViewResults?.()} interiorIcon="arrow-right">
                    Découvrir mon corrigé
                </ActionButton>
            }
        >
            <Box
                direction="column"
                className="items-center gap-5 py-2 text-center"
                aria-live="polite"
            >
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${result.iconStyle}`}>
                    <FAIcon name={result.icon} className="text-2xl" />
                </div>

                <Box direction="column" className="items-center gap-1">
                    <CustomText textTag="h2" weight="bold" className="text-2xl">
                        {result.title}
                    </CustomText>
                    <CustomText color="text-light" className="max-w-md">
                        {result.message}
                    </CustomText>
                </Box>

                {hasScore && percentage !== null ? (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-8 py-6 shadow-sm">
                        <PercentageRing
                            score={percentage}
                            points={`${formatScore(scoreQuiz)} / ${formatScore(totalScore)} pts`}
                            size={144}
                        />
                        <CustomText color="text-light" className="mt-3 text-sm">
                            Score obtenu
                        </CustomText>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-5">
                        <CustomText weight="bold">
                            Votre quiz a bien été enregistré.
                        </CustomText>
                        <CustomText color="text-light" className="mt-1 text-sm">
                            Consultez le corrigé pour découvrir votre résultat détaillé.
                        </CustomText>
                    </div>
                )}
            </Box>
        </Modal>
    );
};

export default ModalQuizFinished;
