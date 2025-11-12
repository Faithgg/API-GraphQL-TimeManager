## Contexte 

Cette application est une idée business, une solution toute entière qui permet aux entreprises de manager le temps de travail de leurs employés. 

## Démarrage rapide

### Prérequis

- [Node.js 20+](https://nodejs.org/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- Un compte [Firebase](https://console.firebase.google.com/)

### Structure du dossier `backend`

Le dossier `backend` contient :
- Le serveur Node.js avec ApolloServer (GraphQL)
- La logique métier et les modèles pour la gestion du temps de travail des employés
- Les configurations de connexion à PostgreSQL et Firebase
- Les scripts npm pour lancer, tester ou build le backend

### Configuration

1. **Firebase**
   - Récupère le fichier `service_account.json` depuis la console Firebase
   - Place-le dans le répertoire `backend`

2. **Variables d’environnement**
   - À la racine de `backend`, crée un fichier `.env` à partir de `.env.example`
   - Remplis les valeurs nécessaires : connexion base de données, informations Firebase, etc.

3. **Installation des dépendances**
   ```
   cd backend
   npm ci
   ```

### Lancer le backend en local

Si tu utilises docker compose :
```
docker-compose down
docker-compose build --no-cache
docker-compose up
```

Sinon, tu peux aussi lancer le backend directement :
```
cd backend
npm run dev
```
ou
```
npm start
```

### Documentation interactive

Grâce à ApolloServer, une playground GraphQL est disponible – tu pourras tester les différentes requêtes et mutations offertes par l’API une fois le backend levé sur `http://localhost:4000/graphql` (url à adapter selon ta config).

### Tests automatisés

Des tests sont présents côté backend :
```
cd backend
npm test
```

---

Retrouve toutes les informations de connexion, exemples de requêtes et guides d’utilisation dans la documentation interne ou via le playground GraphQL.
