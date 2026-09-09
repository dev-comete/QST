# ia/services.py
import json
from google import genai
from google.genai import types
from django.conf import settings
from .prompt import DISTRACTOR_PROMPT

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def tester_connexion_gemini():
    try:
        # On tente avec le modèle standard actuel
        response = client.models.generate_content(
            model='gemini-3.6-flash', 
            contents="Réponds par 'OK' si tu me reçois 5/5."
        )
        return response.text.strip()
        
    except Exception as e:
        # Si le modèle n'est pas trouvé, on demande à Google la liste des modèles autorisés
        try:
            modeles_disponibles = []
            # On liste les modèles disponibles via l'API
            for m in client.models.list():
                # On filtre ceux qui font de la génération de texte
                if 'generateContent' in m.supported_generation_methods:
                    modeles_disponibles.append(m.name)
            
            return f"Modèle introuvable. Voici les modèles exacts que vous pouvez utiliser : {', '.join(modeles_disponibles)}"
        except Exception:
            return f"Erreur détaillée : {str(e)}"

def generer_distracteurs_qcm(enonce: str, bonne_reponse: str) -> list:
    prompt = DISTRACTOR_PROMPT.format(enonce=enonce, bonne_reponse=bonne_reponse)
    
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        distracteurs = json.loads(response.text)
        return distracteurs
        
    except json.JSONDecodeError:
        # On lève une erreur claire au lieu de renvoyer un faux tableau
        raise ValueError("Le format renvoyé par l'IA n'est pas valide.")
    except Exception as e:
        # On fait remonter l'erreur 503 de Google
        raise Exception(f"Erreur de l'API IA : {str(e)}")