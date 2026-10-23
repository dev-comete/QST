"""
DATABASE ACCESS: the only module that touches the ORM.
"""
# TODO: adapt this import to where TypeQuestion lives in your project.
#from ...quizzes.models import TypeQuestion
from quizzes.models import TypeQuestion

def get_type_ids() -> dict[str, int]:
    """{"QCU": 1, "QCM": 2, "OUV": 3} built from the TypeQuestion table."""
    return {t.code.upper(): t.id for t in TypeQuestion.objects.all() if t.code}
