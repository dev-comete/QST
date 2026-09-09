# ia/prompts.py

DISTRACTOR_PROMPT = """Tu es un expert en ingénierie pédagogique.
Génère exactement 3 mauvaises réponses (distracteurs) plausibles pour un QCM.
Les distracteurs doivent cibler des erreurs de logique communes, des confusions fréquentes ou des calculs erronés classiques, tout en restant indéniablement faux.

Question : {enonce}
Bonne réponse attendue : {bonne_reponse}

Règles de formatage :
- Ne génère aucun texte d'introduction ou de conclusion.
- Renvoie UNIQUEMENT un tableau JSON valide contenant des chaînes de caractères.
- Exemple attendu : ["Fausse réponse 1", "Fausse réponse 2", "Fausse réponse 3"]
"""