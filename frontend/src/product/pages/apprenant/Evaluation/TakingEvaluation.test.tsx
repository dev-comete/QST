import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import '@testing-library/jest-dom';
import TakingEvaluation from './TakingEvaluation'; // Adjust path if needed


// --- 1. Mocks ---

// Mocking useAuth to return a fixed user ID
vi.mock('../../../../other/hooks/auth/useAuth', () => ({
    useAuth: () => ({
        authUser: { id: 'test_user_123', role: 'apprenant' }
    })
}));

// Mocking QuizService
vi.mock('../../../../other/services/quizService', () => ({
    QuizService: {
        startQuiz: vi.fn(),
        submitQuiz: vi.fn()
    }
}));
import { QuizService } from '../../../../other/services/quizService';

// Mocking child components to simplify the test tree and focus on logic
vi.mock('../../../../system/organisms/quiz/container/QuizQuestionBloc', () => ({
    default: ({ questions, onToggle }: any) => (
        <div data-testid="mock-question-bloc">
            {questions.map((q: any) => (
                <button
                    key={q.question_id}
                    data-testid={`toggle-btn-${q.question_id}`}
                    onClick={() => onToggle(q.question_id, 'option_1', 'QCU')}
                >
                    Answer {q.question_id}
                </button>
            ))}
        </div>
    )
}));

vi.mock('../../../layout/common/BodyLayout', () => ({
    default: ({ children }: any) => <div data-testid="mock-layout">{children}</div>
}));

// --- 2. Test Suite ---

describe('TakingEvaluation LocalStorage Persistence', () => {
    const mockQuizId = '99';
    const mockVagueId = '5';
    const storageKey = `qst_quiz_answers_${mockQuizId}_${mockVagueId}_test_user_123`;

    beforeEach(() => {
        // Clear localStorage and reset mocks before each test
        localStorage.clear();
        vi.clearAllMocks();

        // Setup the mock response for startQuiz
        (QuizService.startQuiz as any).mockResolvedValue({
            quiz_titre: 'Test Persistence Quiz',
            quiz_duree: '00:30:00',
            heure_debut: new Date().toISOString(),
            questions: [
                { question_id: 'q1', type_question: { code: 'QCU' } }
            ]
        });
    });

    it('should load existing answers from localStorage on mount', async () => {
        // 1. Arrange: Pre-populate localStorage with a saved answer
        const savedAnswers = { 'q1': ['option_saved'] };
        localStorage.setItem(storageKey, JSON.stringify(savedAnswers));

        // 2. Act: Render the component
        render(
            <MemoryRouter initialEntries={[`/quiz/${mockQuizId}/take?vague_id=${mockVagueId}`]}>
                <Routes>
                    <Route path="/quiz/:id/take" element={<TakingEvaluation />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText(/En cours de chargement/i)).toBeNull();
        });

        // 3. Assert: The component should NOT overwrite the loaded answer with []
        // We verify this indirectly by checking the storage immediately after load
        const currentStorage = JSON.parse(localStorage.getItem(storageKey) || '{}');
        expect(currentStorage['q1']).toEqual(['option_saved']);
    });

    it('should save new answers to localStorage when toggled', async () => {
        const user = userEvent.setup();

        // 1. Act: Render the component with an empty localStorage
        render(
            <MemoryRouter initialEntries={[`/quiz/${mockQuizId}/take?vague_id=${mockVagueId}`]}>
                <Routes>
                    <Route path="/quiz/:id/take" element={<TakingEvaluation />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('mock-question-bloc')).toBeTruthy();
        });

        // 2. Act: Click the mock answer button to trigger handleOptionToggle
        const answerButton = screen.getByTestId('toggle-btn-q1');
        await user.click(answerButton);

        // 3. Assert: Check if localStorage was updated correctly
        await waitFor(() => {
            const currentStorage = JSON.parse(localStorage.getItem(storageKey) || '{}');
            expect(currentStorage['q1']).toEqual(['option_1']);
        });
    });
});