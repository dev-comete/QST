import { useState, type Dispatch, type SetStateAction } from "react";
import Box from "../../../atoms/Container/Box";
import TextArea from "../../../atoms/Form/TextArea";
import Select from "../../../atoms/Form/Select";
import Button from "../../../atoms/Button/Button";
import CustomText from "../../../atoms/Text/CustomText";
import FAIcon from "../../../atoms/Icon/FAIcon";
import { formChangeHandler, getSelectData } from "../../../../other/helper/helper";
import BaremeInput from "../../globalParam/input/BaremeInput";
import type { questionIdType, questionType, respType } from "../../../../other/types/questionType";
import { useDistractor } from "../../../../other/hooks/question/useDistractor"; 

interface EnonceFormProps {
    question: questionType;
    setQuestion: Dispatch<SetStateAction<questionType>>;
    questionType: questionIdType[];
    responses: respType[];
    setResponses: Dispatch<SetStateAction<respType[]>>;
}

export const EnonceForm = ({ question, setQuestion, questionType, responses, setResponses } : EnonceFormProps) => {

    const selectionQuestionType = getSelectData(questionType, 'code');
    const selectedQuestionTypeCode = questionType.find((q) => q.id === question.type_id)?.code ?? questionType[0]?.code ?? '';

    const [aiError, setAiError] = useState<string | null>(null);
    const [aiSuccess, setAiSuccess] = useState<boolean>(false);

    const distractorMutation = useDistractor();

    // On récupère l'index de la réponse marquée comme correcte (ou 0 par défaut)
    const correctIndex = responses.findIndex(r => r.est_correct) !== -1 ? responses.findIndex(r => r.est_correct) : 0;
    const bonneReponseActuelle = responses[correctIndex]?.reponse || "";

    const handleGenerateIA = () => {
        setAiError(null);
        setAiSuccess(false);

        distractorMutation.mutate(
            { 
                enonce: question.enonce_question, 
                bonne_reponse: bonneReponseActuelle 
            },
            {
                onSuccess: (data) => {
                    const newResponses = [...responses];
                    let distractorQueue = [...data]; 

                    // 1. S'assurer que la bonne réponse est bien marquée correcte
                    if (newResponses.length === 0) {
                        newResponses.push({ reponse: bonneReponseActuelle, est_correct: true, explication: '' });
                    } else {
                        newResponses[correctIndex].reponse = bonneReponseActuelle;
                        newResponses[correctIndex].est_correct = true;
                    }

                    // 2. Remplir les cases existantes vides avec les distracteurs
                    for (let i = 0; i < newResponses.length; i++) {
                        if (i !== correctIndex && !newResponses[i].est_correct && distractorQueue.length > 0) {
                            if (newResponses[i].reponse.trim() === '') {
                                newResponses[i].reponse = distractorQueue.shift() as string; 
                            }
                        }
                    }

                    // 3. Créer dynamiquement les cases manquantes s'il reste des distracteurs
                    distractorQueue.forEach(dist => {
                        newResponses.push({
                            reponse: dist,
                            est_correct: false,
                            explication: ''
                        });
                    });

                    // 4. Mise à jour de l'état global
                    setResponses(newResponses);
                    setAiSuccess(true);
                },
                onError: (error: any) => {
                    setAiError(error.response?.data?.error || "Erreur lors de la génération IA.");
                }
            }
        );
    };

    return (
        <Box direction="column" className="w-full px-5 space-y-5">
            <Box className="w-full gap-2">
                <Box className="min-w-0 flex-1">
                    <Select
                        id={"type"}
                        name={"type"}
                        selectionValue={selectionQuestionType}
                        label="Type de question"
                        handleChange={formChangeHandler(setQuestion, 'type_id', (value) => {
                            const realId = questionType.find((q) => q.code === value)?.id ?? questionType[0]?.id ?? 0;
                            return Number(realId);
                        })}
                        value={selectedQuestionTypeCode}
                    />
                </Box>
                <Box className="min-w-0 flex-1">
                    <BaremeInput onBaremeChange={() => formChangeHandler(setQuestion, 'bareme_pts')} />
                </Box>
            </Box>
            
            <TextArea
                id={"enonce"}
                name={"enonce"}
                label="Enoncé"
                row={5}
                value={question.enonce_question}
                onChange={formChangeHandler(setQuestion, 'enonce_question')}
                required={true}
                placeholder="Exemple: Comment parler à un client ?"
            />

            {/* --- Section IA sans input redondant --- */}
            {question.enonce_question.length > 0 && selectedQuestionTypeCode !== 'OUV' && (
                <Box direction="column" className="gap-4 p-5 mt-2 bg-slate-50 rounded-xl border border-background shadow-sm">
                    <Box className="justify-between items-center w-full flex-wrap gap-4">
                        <Box direction="column" className="flex-1">
                            <CustomText textTag="h6" weight="bold">Générateur de distracteurs (IA)</CustomText>
                            
                            {bonneReponseActuelle ? (
                                <CustomText textTag="p" className="text-sm text-slate-600 mt-1">
                                    L'IA générera des fausses options basées sur : <CustomText textTag="span" weight="bold" className="text-primary">"{bonneReponseActuelle}"</CustomText>
                                </CustomText>
                            ) : (
                                <CustomText textTag="p" className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                                    <FAIcon name="triangle-exclamation" /> 
                                    Saisissez la bonne réponse dans l'onglet "Options" pour activer la génération.
                                </CustomText>
                            )}
                        </Box>
                        
                        <Button 
                            variant="outline"
                            onClick={handleGenerateIA}
                            disabled={distractorMutation.isPending || !question.enonce_question || !bonneReponseActuelle}
                            isLoading={distractorMutation.isPending}
                        >
                            ✨ Générer les options
                        </Button>
                    </Box>

                    {aiError && (
                        <Box className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <CustomText className="text-red-600 text-sm">{aiError}</CustomText>
                        </Box>
                    )}

                    {aiSuccess && (
                        <Box className="p-3 bg-green-50 border border-green-200 rounded-lg items-center gap-2">
                            <FAIcon name="check-circle" className="text-green-600" />
                            <CustomText className="text-green-700 text-sm font-medium">
                                Succès ! Les champs vides de l'onglet "Options" ont été remplis automatiquement.
                            </CustomText>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};