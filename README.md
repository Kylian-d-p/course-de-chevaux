# Course de chevaux

(une version en ligne est disponible à l'adresse suivante : [https://course-de-chevaux.onwapp.com](https://course-de-chevaux.onwapp.com))

Ce site contient 5 pages :

- /index.html
- /login/index.html
- /play/index.html
- /spectate/index.html
- /leaderboard/index.html

Ainsi que les endpoints suivants :

- GET /api/leaderboard
- POST /api/room/create
- POST /api/room/run
- POST /api/auth/login
- GET /api/auth/user
- POST /api/auth/logout

### Installation

Prérequis :
- Node.js
- pnpm
- Serveur MySQL
- Créer un fichier .env à la racine du projet
  - DATABASE_URL (ex: `mysql://user:password@localhost:3306/database`)
  - PORT (ex: `3000`)
  - SESSION_SECRET (ex: `top-secret`)

### Lancer le projet

- `pnpm install`
- `pnpm dlx prisma migrate dev`
- `pnpm run dev` ou `pnpm run start`

### Fonctionnalités

- Page de connexion (se connecter avec un pseudo inexistant pour créer un compte)
- Jouer une course de chevaux en multi
- Regarder une course de chevaux en multi (possibilité de parier sur le cheval gagnant)

### Axes d'amélioration

- Le code JS est copié/collé entre les pages play et spectate, il faudrait le refactoriser
- Il faudrait différencier la page inscription de la page connexion (+ logique de mot de passe oublié / réinitialisation / etc...)
- Afficher la quantité de coins pariés sur chaque chevaux côté spectateurs (les données sont envoyées, mais pas affichées). Cela permettrait également de voir les cotes et de parier en conséquence.