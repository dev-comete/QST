### 🔹 Backend (Django)
Toute la logique backend, les configurations de la base de données et les points d'accès de l'API (endpoints) se trouvent dans le répertoire backend. 

**[Installation](./backdev/DOCS/installation.md)**

**[Documentation des APIs](./backend/backdev/DOCS/question-create&assign.md)**

### 🔹 Frontend (React)
L'interface utilisateur et la logique côté client se trouvent dans le répertoire frontend.
**[Aller au guide d'installation du Frontend](./frontend/README.md)**

---

## Structure du dépôt

```text
repo/
├── backdev/               # Application Python / Projet Django
│   ├── requirements.txt
    ├── env-example        # un modèle du fichier env pour créer le véritable fichier
│   └── README.md          # <-- Guide d'installation du Backend
├── frontend/              # Application Frontend
│   └── README.md          # <-- Guide d'installation du Frontend
└── README.md              # <-- Ce fichier