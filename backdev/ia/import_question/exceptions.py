"""
Domain errors for the question import.

Every layer raises one of these instead of leaking library exceptions.
The view is the only place that turns them into HTTP responses.

- `message` : safe, user-facing text (sent to the client)
- `detail`  : technical info for the logs (NEVER sent to the client)
"""


class QuestionImportError(Exception):
    code = "import_error"
    http_status = 400
    default_message = "L'import a échoué."

    def __init__(self, message: str | None = None, *, detail: str | None = None):
        self.message = message or self.default_message
        self.detail = detail
        super().__init__(self.message)


# --- input problems (400 / 413 / 422) -------------------------------------

class UnsupportedFileType(QuestionImportError):
    code = "unsupported_file_type"
    http_status = 400
    default_message = "Format de fichier non supporté."


class DocumentTooLarge(QuestionImportError):
    code = "document_too_large"
    http_status = 413
    default_message = "Le document est trop volumineux."


class UnreadableFile(QuestionImportError):
    code = "unreadable_file"
    http_status = 400
    default_message = "Impossible de lire ce fichier (corrompu ou protégé ?)."


class EmptyDocument(QuestionImportError):
    code = "empty_document"
    http_status = 422
    default_message = "Le document ne contient pas assez de texte exploitable."


# --- AI problems (422 / 502 / 503) ----------------------------------------

class LLMUnavailable(QuestionImportError):
    code = "llm_unavailable"
    http_status = 503
    default_message = "Le service d'IA est momentanément surchargé. Veuillez réessayer."


class LLMRequestFailed(QuestionImportError):
    code = "llm_request_failed"
    http_status = 502
    default_message = "Le service d'IA a refusé la requête."


class LLMTruncated(QuestionImportError):
    code = "llm_truncated"
    http_status = 422
    default_message = "Document trop long : découpez-le en plusieurs fichiers."


class LLMOutputInvalid(QuestionImportError):
    code = "llm_output_invalid"
    http_status = 502
    default_message = "La réponse de l'IA est inexploitable. Veuillez réessayer."
