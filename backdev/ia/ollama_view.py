import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny # AllowAny pour tester facilement sans token

class TestOllamaAPIView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        # host.docker.internal permet au conteneur Docker de cibler votre machine hôte
        url = "http://host.docker.internal:11434/api/generate"
        
        payload = {
            "model": "llama3.2",
            "prompt": "Dis bonjour et présente-toi en une seule phrase très courte.",
            "stream": False
        }
        
        try:
            # On envoie la requête à Ollama
            response = requests.post(url, json=payload, timeout=15)
            response.raise_for_status() # Lève une erreur si le statut n'est pas 200 OK
            
            # On extrait la réponse
            data = response.json()
            texte_ia = data.get("response", "").strip()
            
            return Response({
                "statut": "succès",
                "message": "Connexion à Ollama réussie !",
                "reponse_ia": texte_ia
            })
            
        except requests.exceptions.ConnectionError:
            return Response({
                "statut": "erreur",
                "message": "Impossible de se connecter à Ollama. Est-il bien lancé sur votre machine hôte ?"
            }, status=503)
        except Exception as e:
            return Response({
                "statut": "erreur",
                "message": f"Erreur inattendue : {str(e)}"
            }, status=500)