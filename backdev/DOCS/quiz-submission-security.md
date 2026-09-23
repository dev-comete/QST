# Quiz Submission Security — `submit_entire_quiz`

This document explains the security protections built into the quiz submission service, why each one exists, and what real-world attack or failure scenario it defends against.

---

## Overview

`submit_entire_quiz` is the function responsible for grading a learner's quiz attempt. Because it handles **scoring, timing, and payload data supplied by the client**, it's a natural target for cheating attempts — from simple double-clicking to deliberate exploitation of race conditions and malformed requests. Each protection below maps directly to a category of risk.

---

## 1. Row-level locking (`select_for_update()`)

### The risk it addresses: concurrent/duplicate submissions

**Without locking**, if a user fires two submission requests at nearly the same time — say, by double-clicking "Submit," or by a browser retry, or deliberately using a script — both requests can read the database *before either has saved anything*. Both see `termine = False`. Both proceed to grade and save. Result: duplicate `Valiny` rows, a score that may be recorded twice, or corrupted state where two different scores race to be the "final" one.

### Real-life hack attempt

> A learner scripts two parallel HTTP requests to `/quiz/42/submit/` — one with correct answers, one with random guesses — hoping the timing quirk lets the higher-scoring attempt "win" or that duplicate `Valiny` entries inflate their recorded score in a downstream aggregate query.

### The fix

```python
quiz_attempt = (
    UtilisateurQuiz.objects
    .select_for_update()
    .get(quiz_id=quiz_id, utilisateur=user)
)
```

`select_for_update()` places a database-level lock on that specific `UtilisateurQuiz` row for the duration of the transaction. The second request has to **wait** until the first one fully commits before it can even read the row — at which point it sees `termine = True` and is rejected. The two requests are serialized instead of racing.

---

## 2. Splitting the expiry write into its own transaction

### The risk it addresses: a security check that "fires" but doesn't stick

The original code did this, all inside one `@transaction.atomic` block:

```python
quiz_attempt.termine = True
quiz_attempt.save(update_fields=['termine'])
raise ValidationError("Le temps imparti est écoulé...")
```

This looks correct, but it isn't: when the `ValidationError` propagates out of an atomic block, **Django rolls back everything that happened inside that block** — including the `save()` that just ran. The database never actually records `termine = True`. The lock-out doesn't persist.

### Real-life hack attempt

> A learner's timer expires. Their first submission is correctly rejected with "time's up" — but because the rollback silently undid the `termine=True` write, the attempt is still technically open in the database. If any other checks in the system relied on `termine` being set (e.g. "assume expired attempts are locked, no need to re-check duration"), a crafted second request replaying the same payload could sneak through logic that trusted the flag instead of re-verifying elapsed time.

### The fix

The expiry check now lives in its **own** `transaction.atomic()` block (`_lock_and_validate_attempt`). When time is up, that block sets `termine = True`, saves it, and **returns normally** — no exception raised from inside it — so the transaction commits. Only afterward, back in the caller, do we raise `ValidationError`. The lock-out is now durable: a retried submission will hit the "already submitted" check (Step 2 below) instead of getting a second chance to race the clock.

---

## 3. Rejecting a start time in the future

### The risk it addresses: timestamp tampering / clock skew

`time_elapsed = now() - heure_debut` is the entire basis of the time-limit check. If `heure_debut` is ever in the future relative to the server clock — through a bug, a bad migration, or a client attempting to manipulate stored start time via some other endpoint — `time_elapsed` becomes **negative**, which is always less than `max_allowed_time`. The timer effectively never expires.

### Real-life hack attempt

> A learner finds (or brute-forces) an endpoint that lets them re-trigger "quiz start," or a replay of a start request with a manipulated payload sets `heure_debut` to next week. Every subsequent time check now computes a negative elapsed time, so the learner has effectively unlimited time to research answers, consult classmates, or use external tools — while the system still shows them as "in progress" with time to spare.

### The fix

```python
if quiz_attempt.heure_debut > current_time:
    raise ValidationError("Horodatage de démarrage invalide.")
```

Any start time later than "now" is treated as invalid input and rejected outright, rather than silently producing a favorable (negative) elapsed time.

> **Note:** this check only catches the *symptom*. The real fix is ensuring `heure_debut` is always set server-side (using `now()`) when a quiz officially starts, and never accepted as client-supplied input. See "Recommendations" below.

---

## 4. Re-locking inside the outer transaction (defense in depth)

### The risk it addresses: the gap between two transactions

`_lock_and_validate_attempt` runs in its own transaction and **releases its row lock the moment it commits**. There's a small window between that commit and the start of the outer `submit_entire_quiz` transaction where, in theory, another process could act on the same row.

### Real-life hack attempt

> Extremely tight timing: a second request slips in during the microsecond gap between the validation transaction committing and the grading transaction starting its own lock, attempting to squeeze through before `termine` is set.

### The fix

```python
quiz_attempt = (
    UtilisateurQuiz.objects
    .select_for_update()
    .get(pk=quiz_attempt.pk)
)
if quiz_attempt.termine:
    raise ValidationError("Vous avez déjà soumis ce quiz.")
```

The outer transaction re-acquires the lock and re-checks `termine` before grading begins. This costs one extra cheap query and closes the gap entirely — belt and braces.

---

## 5. Payload sanitization (malformed input handling)

### The risk it addresses: crashes and denial-of-service via bad input

The original loop did `int(str_question_id)` and used `submitted_reponse_ids` directly with no validation. If a client sent a non-numeric question ID, or a list containing a string, dict, or `null` where an answer ID was expected, this would raise an uncaught `ValueError` or `TypeError` **mid-transaction** — crashing the whole request with a raw 500 error, and rolling back the entire quiz submission (including questions that had already been graded correctly in the loop).

### Real-life hack attempt

> A learner intercepts the submission request in browser dev tools and edits the JSON payload, replacing one `question_id` key with `"'; DROP TABLE--"` or injecting `null` into an answers array — not necessarily to inject SQL (the ORM parameterizes queries safely), but to **deliberately crash the endpoint**, either to deny service, to probe for stack traces that leak internal details, or to find a code path where an exception is thrown *after* partial grading but *before* the final `termine` flag is set — potentially leaving the attempt in a retriable, ungraded-but-not-locked state.

### The fix

```python
try:
    question_id = int(str_question_id)
    submitted_set = {int(r) for r in submitted_reponse_ids}
except (TypeError, ValueError):
    continue  # skip this malformed entry, don't kill the whole submission
```

A malformed entry is skipped individually instead of aborting the entire grading process. The rest of the quiz is still graded correctly, and no stack trace or unhandled exception reaches the client.

---

## 6. Exact-match grading with a non-empty guard

### The risk it addresses: partial-credit gaming and misconfigured questions

```python
is_correct = (submitted_set == correct_rep_ids) and len(correct_rep_ids) > 0
```

Two things are enforced here:

1. **Exact set equality** — a learner can't earn credit by selecting *every* option to guarantee they included the correct one(s) alongside wrong ones. Correct means correct **and only** correct.
2. **Non-empty guard** — if a question is misconfigured in the database with zero `Corrigee` rows marked `est_correct=True` (a content/admin error, not a user attack), the exact-match logic (`set() == set()`) would otherwise award full points for submitting *nothing*.

### Real-life hack attempt

> A learner notices that a question with a data-entry mistake has no correct answer marked in the admin panel. Without the guard, submitting an empty answer set for that question would satisfy `submitted_set == correct_rep_ids` (both empty) and award full points for free — a scoring exploit rooted in a content bug rather than code, but one the code should defend against anyway.

### The fix

The `len(correct_rep_ids) > 0` clause ensures a question with no defined correct answer can never be "solved" by submitting nothing — it always grades as incorrect until the content is fixed.

---

## 7. Question-ownership validation (`QuizQuestion.DoesNotExist` → skip)

### The risk it addresses: cross-quiz answer injection

```python
quiz_question = QuizQuestion.objects.select_related('bareme').get(
    quiz_id=quiz_id,
    question_id=question_id
)
```

This confirms the submitted `question_id` actually belongs to `quiz_id`. Without it, a crafted payload could reference a question from a *different* quiz entirely.

### Real-life hack attempt

> A learner discovers that Quiz B contains an easier version of a question that also happens to exist (with a different `bareme`/point value) in Quiz A. They edit their submission for Quiz A to include a `question_id` that actually belongs to Quiz B, hoping the backend grades it using Quiz B's context or awards points meant for a different assignment.

### The fix

If the `(quiz_id, question_id)` pair doesn't correspond to a real `QuizQuestion` link, the entry is silently skipped — it contributes nothing to the score and creates no `Valiny` record.

---

## Summary Table

| # | Protection | Attack it stops | Mechanism |
|---|---|---|---|
| 1 | Row locking | Duplicate/parallel submissions | `select_for_update()` |
| 2 | Isolated expiry transaction | Timeout write getting rolled back | Separate `atomic()` block that commits before raising |
| 3 | Future-timestamp rejection | Manipulated/skewed start time granting unlimited time | Explicit `heure_debut > now()` check |
| 4 | Re-lock in outer transaction | Race in the gap between two transactions | Second `select_for_update()` + re-check |
| 5 | Payload sanitization | Crash/DoS via malformed JSON, partial-grading corruption | Per-entry `try/except`, skip on failure |
| 6 | Exact-match + non-empty guard | "Select everything" gaming, free points on misconfigured questions | Set equality with non-empty check |
| 7 | Question-ownership check | Cross-quiz question/answer injection | `QuizQuestion.get(quiz_id, question_id)` |

---

## Recommendations Beyond This Function

These are outside `submit_entire_quiz` itself but close related gaps:

- **Server-side `heure_debut`**: ensure the "start quiz" endpoint sets `heure_debut = now()` on the server and never accepts it as client input. This is the real root fix for risk #3 — the future-timestamp check is a safety net, not a substitute.
- **DB-level uniqueness constraint**: add `unique_together` (or a `UniqueConstraint`) on `Valiny(utilisateur, question)` as a last line of defense beneath the row lock, in case of an edge case the application-level lock doesn't cover.
- **Rate limiting**: apply DRF's `UserRateThrottle` (or similar) on the submission endpoint to blunt scripted rapid-fire submission attempts at the HTTP layer, independent of the transactional protections above.
- **Audit logging**: consider logging rejected submissions (expired, duplicate, invalid question) with user + timestamp, to help spot patterns of repeated exploitation attempts.
