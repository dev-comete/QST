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

---

## Installation avec Docker

Pour une installation complète et isolée utilisant Docker, consultez [Docker Deployment Configuration](docker-deployment.md).

### Installation Rapide avec Docker

1. **Créer le fichier `.env`** dans le répertoire `backdev` :
   ```bash
   DB_HOST=db
   DB_NAME=qst_database
   DB_USER=qst_user
   DB_PASSWORD=your_secure_password_here
   ```

2. **Construire les images Docker** :
   ```bash
   docker-compose build
   ```

3. **Démarrer les services** :
   ```bash
   docker-compose up -d
   ```

4. **Accéder à l'application** :
   - API Django : `http://localhost:8000/`
   - Base de données PostgreSQL : `localhost:5434`

### Commandes Utiles

```bash
# Voir l'état des services
docker-compose ps

# Afficher les logs
docker-compose logs -f web

# Créer un super-utilisateur
docker-compose exec web python manage.py createsuperuser

# Arrêter les services
docker-compose down
```

Pour plus de détails sur la configuration Docker, voir [Docker Deployment Configuration](docker-deployment.md).