# 🐎 Course de Chevaux - Guide Docker

## 📋 Prérequis

- [Docker](https://www.docker.com/get-started) installé
- [Docker Compose](https://docs.docker.com/compose/install/) installé

## 🚀 Démarrage rapide

### 1. Configuration de l'environnement

Créez le fichier `.env` à la racine du projet.
```
PORT=xxx
DATABASE_URL=xxx
SESSION_SECRET=xxx

# Docker MySQL credentials
MYSQL_ROOT_PASSWORD=xxx
MYSQL_DATABASE=xxx
MYSQL_USER=xxx
MYSQL_PASSWORD=xxx
```

### 2. Développement avec Docker

Pour le développement local, utilisez Docker uniquement pour la base de données :

```bash
# Démarrer la base de données MySQL
docker-compose -f docker-compose.dev.yml up -d

# Installer les dépendances
pnpm install

# Appliquer les migrations Prisma
pnpm dlx prisma migrate dev

# Lancer l'application en mode développement
pnpm run dev
```

La base de données sera accessible sur `localhost:3306`.

### 3. Production avec Docker

Pour déployer l'application complète (app + base de données) :

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Ou en mode détaché avec build forcé
docker-compose up -d --build
```

L'application sera accessible sur `http://localhost:3000`.

## 🛠️ Commandes Docker utiles

### Gestion des containers

```bash
# Voir les logs
docker-compose logs -f app

# Voir les logs de la base de données
docker-compose logs -f db

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Redémarrer un service
docker-compose restart app

# Reconstruire l'image
docker-compose build --no-cache
```

### Base de données

```bash
# Accéder au shell MySQL
docker-compose exec db mysql -u courseuser -pcoursepassword course_de_chevaux

# Sauvegarder la base de données
docker-compose exec db mysqldump -u courseuser -pcoursepassword course_de_chevaux > backup.sql

# Restaurer la base de données
docker-compose exec -T db mysql -u courseuser -pcoursepassword course_de_chevaux < backup.sql

# Exécuter les migrations Prisma
docker-compose exec app pnpm dlx prisma migrate deploy
```

### Développement

```bash
# Exécuter une commande dans le container
docker-compose exec app sh

# Installer une nouvelle dépendance
docker-compose exec app pnpm add <package-name>

# Générer le client Prisma
docker-compose exec app pnpm dlx prisma generate
```

## 📁 Structure Docker

- `Dockerfile` : Image de production multi-stage
- `docker-compose.yml` : Configuration complète (app + db) pour production
- `docker-compose.dev.yml` : Configuration base de données uniquement pour développement
- `.dockerignore` : Fichiers exclus de l'image Docker
- `.env.example` : Exemple de configuration

## 🔧 Variables d'environnement

| Variable              | Description               | Valeur par défaut      |
| --------------------- | ------------------------- | ---------------------- |
| `PORT`                | Port de l'application     | `3000`                 |
| `SESSION_SECRET`      | Secret pour les sessions  | À définir              |
| `DATABASE_URL`        | URL de connexion MySQL    | Généré automatiquement |
| `MYSQL_ROOT_PASSWORD` | Mot de passe root MySQL   | `rootpassword`         |
| `MYSQL_DATABASE`      | Nom de la base de données | `course_de_chevaux`    |
| `MYSQL_USER`          | Utilisateur MySQL         | `courseuser`           |
| `MYSQL_PASSWORD`      | Mot de passe MySQL        | `coursepassword`       |

## 🐛 Dépannage

### Le container app ne démarre pas

Vérifiez que la base de données est prête :

```bash
docker-compose logs db
```

### Erreur de connexion à la base de données

Vérifiez que `DATABASE_URL` dans `.env` correspond aux credentials MySQL.

### Les migrations ne s'appliquent pas

Exécutez manuellement :

```bash
docker-compose exec app pnpm dlx prisma migrate deploy
```

### Port déjà utilisé

Changez le port dans `.env` :

```
PORT=3001
```

## 🔒 Sécurité en production

1. ⚠️ Changez **tous** les mots de passe par défaut
2. 🔑 Utilisez un `SESSION_SECRET` fort et unique
3. 🛡️ N'exposez pas le port MySQL (3306) en production
4. 📦 Utilisez des volumes pour persister les données
5. 🔄 Mettez à jour régulièrement les images Docker

## 📊 Monitoring

Pour surveiller les ressources utilisées :

```bash
# Voir l'utilisation CPU/RAM
docker stats

# Voir les containers en cours
docker-compose ps
```
