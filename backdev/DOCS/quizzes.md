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
| [Question Bank Search API](./question-bank-search.md) | `GET` | Search and paginate the question bank by text and/or type before assigning questions to a quiz. |
| [Core Resource CRUD APIs](./crud.md) | `GET`/`POST`/`PUT`/`PATCH`/`DELETE` | Standard CRUD over `Quiz`, `Question`, `Reponse`, `TypeQuestion`, `Bareme`, and the question link tables. |

## 🧩 Quiz Assembly

| API | Method | Description |
| :--- | :---: | :--- |
| [Assign Questions API](./question-assign.md) | `POST` | Attach existing bank questions to a quiz, each with its own type/barème configuration. |
| [Assign Quiz to Vague API](./quiz-to-vague.md) | `POST` | Assign an existing quiz to an entire classroom (`Vague`) in bulk. |

## 👩‍🎓 Student Assignment & Progress

| API | Method | Description |
| :--- | :---: | :--- |
| [Assign Student to Quiz API](./student-assign.md) | `POST` | Assign a single apprenant to a specific quiz after checking enrollment and ownership. |
| [Assign Students to Vague API](./student-to-vague.md) | `POST` | Enroll one or many apprenants into a vague and auto-assign all quizzes from the formation. |
| [My To-Do Quizzes API](./student-todo.md) | `GET` | List a student's unfinished assigned quizzes. |
| [Submit Quiz API](./quiz-submit.md) | `POST` | Submit a student's answers for scoring. |
| [Quiz Review API](./quiz-review.md) | `GET` | Review a submitted quiz and inspect its evaluation details. |
| [Quiz Submission Security API](./quiz-submission-security.md) | `POST` | Enforce submission security checks before accepting a quiz submission. |

## 📊 Analytics & Reporting

| API | Method | Description |
| :--- | :---: | :--- |
| [Formateur Vague Analytics API](./formateur-vague-analytics.md) | `GET` | Retrieve aggregate analytics for a vague as a formateur or admin. |
| [Apprenant Bulletin API](./apprenant-bulletin.md) | `GET` | View a student's detailed bulletin for a specific vague. |
| [ Analytics maths](./analytics.md) | `DOCS` | Explains how calculs are made. |

---

## Role Summary

| Role | Can Do |
| :--- | :--- |
| **Formateur** (owner of the Formation) | Create/edit questions, assign questions to their own quizzes, assign students to their own quizzes, view all resources. |
| **Admin / Staff** | Everything a Formateur can do, across *any* Formation — ownership checks are bypassed for admins. |
| **Apprenant** | View their own to-do list, submit answers for assigned quizzes. |

---

