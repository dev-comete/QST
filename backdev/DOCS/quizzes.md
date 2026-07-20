# Quiz Module — API Documentation

This is the entry point for the Quiz app's API documentation. It covers question authoring, quiz assembly, student assignment, and quiz submission/scoring.

All endpoints require authentication unless noted otherwise. Permission classes referenced below (`IsFormateurOrAdminOrReadOnly`, `IsApprenant`) are defined in `permissions.py`.

---

## 📚 Question Bank

| API | Method | Description |
| :--- | :---: | :--- |
| [Create Full Question API](./question-create.md) | `POST` | Create a question with type, barème, and all answer options in one call. |
| [Core Resource CRUD APIs](./crud.md) | `GET`/`POST`/`PUT`/`PATCH`/`DELETE` | Standard CRUD over `Quiz`, `Question`, `Reponse`, `TypeQuestion`, `Bareme`, and the question link tables. |

## 🧩 Quiz Assembly

| API | Method | Description |
| :--- | :---: | :--- |
| [Assign Questions API](./question-assign.md) | `POST` | Attach existing bank questions to a quiz, each with its own type/barème configuration. |
| [Assign Quiz to Vague API](./quiz-to-vague.md) | `POST` | Assign an existing quiz to an entire classroom (`Vague`) in bulk. |

## 👩‍🎓 Student Assignment & Progress

| API | Method | Description |
| :--- | :---: | :--- |
| [Assign Student API](./student-assign.md) | `POST` | Assign an individual student to a quiz. |
| [My To-Do Quizzes API](./student-todo.md) | `GET` | List a student's unfinished assigned quizzes. |
| [Submit Quiz API](./quiz-submit.md) | `POST` | Submit a student's answers for scoring. |
| [Quiz Review API](./quiz-review.md) | `GET` | Review a submitted quiz and inspect its evaluation details. |
| [Quiz Submission Security API](./quiz-submission-security.md) | `POST` | Enforce submission security checks before accepting a quiz submission. |

---

## Role Summary

| Role | Can Do |
| :--- | :--- |
| **Formateur** (owner of the Formation) | Create/edit questions, assign questions to their own quizzes, assign students to their own quizzes, view all resources. |
| **Admin / Staff** | Everything a Formateur can do, across *any* Formation — ownership checks are bypassed for admins. |
| **Apprenant** | View their own to-do list, submit answers for assigned quizzes. |

---

