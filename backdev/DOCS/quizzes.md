# Quiz Module — API Documentation

This is the entry point for the Quiz app's API documentation. It covers question authoring, quiz assembly, student assignment, and quiz submission/scoring.

All endpoints require authentication unless noted otherwise. Permission classes referenced below (`IsFormateurOrAdminOrReadOnly`, `IsApprenant`) are defined in `permissions.py`.

---

## � Authentication

| API | Method | Description |
| :--- | :---: | :--- |
| [Auth Login API](./auth-login.md) | `POST` | Authenticate a user and receive JWT tokens plus profile and organization details. |
| [Auth Logout API](./auth-logout.md) | `POST` | Invalidate the refresh token and log the user out. |
| [Django Built-In Accounts Endpoints](./auth-urls.md) | `GET`/`POST` | Browser-based login/logout/password reset/change views included from Django. |

## �📚 Question Bank

| API | Method | Description |
| :--- | :---: | :--- |
| [Create Full Question API](./question-create.md) | `POST` | Create a question with type, barème, and all answer options in one call. |
| [Question Bank Search API](./question-bank-search.md) | `GET` | Search and paginate the question bank by text and/or type before assigning questions to a quiz. || [Question Detail API](./question-detail.md) | `GET` | Retrieve detailed information about a specific question. || [Core Resource CRUD APIs](./crud.md) | `GET`/`POST`/`PUT`/`PATCH`/`DELETE` | Standard CRUD over `Quiz`, `Question`, `Reponse`, `TypeQuestion`, `Bareme`, and the question link tables. |

## 🧩 Quiz Assembly

| API | Method | Description |
| :--- | :---: | :--- |
| [Assign Questions API](./question-assign.md) | `POST` | Attach existing bank questions to a quiz, each with its own type/barème configuration. |
| [Assign Quiz to Vague API](./quiz-to-vague.md) | `POST` | Assign an existing quiz to an entire classroom (`Vague`) in bulk. |
| [Quiz Assigned Questions API](./quiz-assigned-questions.md) | `GET` | Return a detailed list of questions assigned to a specific quiz. |
| [Remove Question from Quiz API](./remove-question-from-quiz.md) | `POST` | Remove a question from a quiz (draft only). |

## 👩‍🎓 Student Assignment & Progress

| API | Method | Description |
| :--- | :---: | :--- |
| [Assign Student to Quiz API](./student-assign.md) | `POST` | Assign a single apprenant to a specific quiz after checking enrollment and ownership. |
| [Assign Students to Vague API](./student-to-vague.md) | `POST` | Enroll one or many apprenants into a vague and auto-assign all quizzes from the formation. |
| [My To-Do Quizzes API](./student-todo.md) | `GET` | List a student's unfinished assigned quizzes. |
| [My Quiz List API](./apprenant-quiz-list.md) | `GET` | List all quizzes assigned to a student (including completed ones). |
| [Take Quiz API](./take-quiz.md) | `GET` | Fetch quiz details and questions for a student to begin taking it. |
| [Submit Quiz API](./quiz-submit.md) | `POST` | Submit a student's answers for scoring. |
| [Quiz Review API](./quiz-review.md) | `GET` | Review a submitted quiz and inspect its evaluation details. |

## 📊 Analytics & Reporting

| API | Method | Description |
| :--- | :---: | :--- |
| [Dashboard Metrics API](./dashboard-metrics.md) | `GET` | Get KPIs and summary stats for formateurs/admins. |
| [Formateur Vague Analytics API](./formateur-vague-analytics.md) | `GET` | Retrieve aggregate analytics for a vague as a formateur or admin. |
| [Apprenant Bulletin API](./apprenant-bulletin.md) | `GET` | View a student's detailed bulletin for a specific vague. |
| [Apprenant Bulletin PDF API](./bulletin-pdf.md) | `GET` | Download a student's bulletin as a PDF file. |
| [Analytics Maths Guide](./analytics.md) | `DOCS` | Explains how calculations are made. |

## 📚 Vague Management

| API | Method | Description |
| :--- | :---: | :--- |
| [Vague Management APIs](./vague-management.md) | `GET`/`POST`/`PATCH` | Create, list, update, and manage vagues (class cohorts). |

---

## Role Summary

| Role | Can Do |
| :--- | :--- |
| **Formateur** (owner of the Formation) | Create/edit questions, assign questions to their own quizzes, assign students to their own quizzes, view all resources. |
| **Admin / Staff** | Everything a Formateur can do, across *any* Formation — ownership checks are bypassed for admins. |
| **Apprenant** | View their own to-do list, submit answers for assigned quizzes, view their bulletin and quiz reviews. |

---

