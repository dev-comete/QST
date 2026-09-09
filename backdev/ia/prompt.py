# ia/prompts.py

DISTRACTOR_PROMPT = """Tu es un expert en ingénierie pédagogique.
Génère exactement 3 mauvaises réponses (distracteurs) plausibles pour une question à choix multiples (QCM/QCU).
Les distracteurs doivent cibler des erreurs de logique communes, des confusions fréquentes ou des calculs erronés classiques, tout en restant indéniablement faux.

Question : {enonce}
Bonne(s) réponse(s) déjà choisie(s) : {bonne_reponse}

Règles de formatage :
- Les distracteurs ne doivent en aucun cas être des synonymes ou des variantes des bonnes réponses fournies.
- Si plusieurs bonnes réponses sont fournies (séparées par " | "), assure-toi que tes distracteurs sont faux par rapport à TOUTES ces réponses.
- Ne génère aucun texte d'introduction ou de conclusion.
- Renvoie UNIQUEMENT un tableau JSON valide contenant des chaînes de caractères.
- Exemple attendu : ["Fausse réponse 1", "Fausse réponse 2", "Fausse réponse 3"]
"""