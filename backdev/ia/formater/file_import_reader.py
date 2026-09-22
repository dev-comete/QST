# ia/services.py (ajoutez ceci au-dessus de vos autres fonctions)
import io
import PyPDF2
import docx

def extraire_texte_fichier(fichier) -> str:
    nom_fichier = fichier.name.lower()
    texte = ""

    try:
        # Fichier Texte classique (.txt, .md, .csv)
        if nom_fichier.endswith(('.txt', '.md', '.csv')):
            texte = fichier.read().decode('utf-8')

        # Fichier PDF (.pdf)
        elif nom_fichier.endswith('.pdf'):
            lecteur_pdf = PyPDF2.PdfReader(fichier)
            for page in lecteur_pdf.pages:
                texte += page.extract_text() + "\n"

        # Fichier Word (.docx)
        elif nom_fichier.endswith('.docx'):
            doc = docx.Document(fichier)
            for para in doc.paragraphs:
                texte += para.text + "\n"
        else:
            raise ValueError("Format de fichier non supporté. Utilisez PDF, DOCX ou TXT.")
            
        return texte.strip()
    except Exception as e:
        raise Exception(f"Impossible de lire le fichier : {str(e)}")