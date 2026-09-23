# ia/services.py
import json
from google import genai
from google.genai import types
from django.conf import settings

from .prompts.prompt_distractor import DISTRACTOR_PROMPT
from .prompts.prompt_import import IMPORT_TEXT_PROMPT

client = genai.Client(api_key=settings.GEMINI_API_KEY, http_options=types.HttpOptions(
        retry_options=types.HttpRetryOptions(
            attempts=5,
            initial_delay=1.0,
            max_delay=20.0,
            exp_base=2,
            http_status_codes=[429, 500, 502, 503, 504],
        )
    ),)
model = 'gemini-3.6-flash'

def tester_connexion_gemini():
    try:
        # On tente avec le modèle standard actuel
        response = client.models.generate_content(
            model=model, 
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
            model=model,
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

def parser_questions_brutes(raw_text: str) -> list:
    prompt = IMPORT_TEXT_PROMPT.replace("{raw_text}", raw_text)
    
    try:
        response = client.models.generate_content(
            model=model, 
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        # 🌟 1. NETTOYAGE : On retire les balises Markdown si Gemini en a généré
        texte_ia = response.text.strip()
        if texte_ia.startswith('```json'):
            texte_ia = texte_ia[7:]
        elif texte_ia.startswith('```'):
            texte_ia = texte_ia[3:]
            
        if texte_ia.endswith('```'):
            texte_ia = texte_ia[:-3]
            
        texte_ia = texte_ia.strip()
        
        # 🌟 2. PARSING
        questions_extraites = json.loads(texte_ia)
        
        # 🌟 3. SÉCURITÉ : Gemini peut parfois renvoyer un objet {"questions": [...]} au lieu d'un tableau direct
        if isinstance(questions_extraites, dict):
            # Si c'est un dictionnaire, on essaie de trouver la liste dedans
            for key in questions_extraites.keys():
                if isinstance(questions_extraites[key], list):
                    return questions_extraites[key]
            return [questions_extraites] # Fallback
            
        if not isinstance(questions_extraites, list):
            return []

        return questions_extraites
        
    except json.JSONDecodeError as e:
        # Affichage debug dans votre terminal
        print("--- ERREUR DE LECTURE JSON ---")
        print(response.text if hasattr(response, 'text') else "Aucun texte")
        raise ValueError("Le format renvoyé par l'IA n'est pas un JSON valide.")
    except Exception as e:
        raise Exception(f"Erreur de l'API IA : {str(e)}")