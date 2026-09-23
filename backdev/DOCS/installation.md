### Installation et Configuration

1. **Créer l'environnement virtuel** :
   ```bash
   python -m venv venv
   ```

2. **Activer l'environnement virtuel** :
   * **Windows** 
     ```cmd
     .venv\Scripts\activate.bat
     ```
   * **Windows** 
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux** 
     ```bash
     source .venv/bin/activate
     ```

3. **Installer les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

4. **Appliquer les migrations de la base de données** :
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Lancer le serveur de développement** :
   ```bash
   python manage.py runserver
   ```