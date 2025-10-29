# Intescia API - Exemples d'utilisation

Ce projet contient des exemples d'appels à l'API Intescia, démontrant l'authentification et diverses opérations courantes.

## 🎯 Description

Ce repository fournit des exemples concrets d'intégration avec l'API Intescia, incluant l'authentification OAuth2/OIDC et l'utilisation de différents endpoints de l'API. Les exemples sont conçus pour être simples et facilement adaptables à vos propres besoins.

## 🛠️ Technologies utilisées

- **[Node.js](https://nodejs.org/)** - Environnement d'exécution JavaScript
- **[TypeScript](https://www.typescriptlang.org/)** (v5.8.3) - Typage statique pour JavaScript
- **[Yarn](https://yarnpkg.com/)** (v4.10.3) - Gestionnaire de paquets
- **[Vite](https://vitejs.dev/)** - Outil de build et serveur de développement
- **[oidc-client-ts](https://github.com/authts/oidc-client-ts)** - Client OpenID Connect pour l'authentification
- **[swagger-typescript-api](https://github.com/acacode/swagger-typescript-api)** - Génération automatique du client API TypeScript
- **[ESLint](https://eslint.org/)** + **[Prettier](https://prettier.com/)** - Qualité et formatage du code

## 📋 Prérequis

- Node.js (version récente recommandée)
- Yarn 4.10.3 (géré automatiquement par packageManager)
- Un compte Intescia avec des credentials OAuth2 (clientId, clientSecret)

## 🚀 Installation

```bash
# Cloner le repository
git clone <repository-url>
cd intescia-samples

# Installer les dépendances
yarn install

# Générer le client API TypeScript depuis la spec OpenAPI (à faire après avoir modifié le fichier de configuration
yarn generate:api
```

## ⚙️ Configuration

Modifiez le fichier `config.ts` avec vos propres credentials :

```typescript
export default {
  clientId: 'votre-client-id',
  redirectUri: 'http://localhost:3000/features/login/index.html?callback=true',
  documentationUrl: '<lien vers la documentation d\'API à récupérer sur votre compte d\organisation>',
};
```

## 🎮 Utilisation

```bash
# Démarrer le serveur de développement
yarn start
```

Le serveur démarre sur `http://localhost:3000`. Naviguez vers les différentes pages d'exemples :

- `/features/login/` - Authentification OAuth2/OIDC
- `/features/users/` - Recherche et liste des utilisateurs
- `/features/die/` - Gestion des commandes de découpe et rapports

## 📚 Use Cases couverts

### 1. **Authentification (Login)**
📁 `features/login/`

- ✅ Connexion via OAuth2/OIDC avec Keycloak
- ✅ Gestion du refresh token automatique
- ✅ Déconnexion
- ✅ Callback après authentification
- ✅ Stockage des tokens dans le localStorage

**Points clés :**
- Utilise `oidc-client-ts` pour la gestion complète du flux OAuth2
- Gestion automatique de l'expiration des tokens
- Redirection vers la page d'origine après login

### 2. **Gestion des utilisateurs (Users)**
📁 `features/users/`

- ✅ Recherche d'utilisateurs dans l'organisation courante
- ✅ Filtrage des utilisateurs
- ✅ Affichage du statut (enabled/disabled)

**Endpoint utilisé :**
```typescript
POST /me/organization/users/search
```

**Exemple de code :**
```typescript
const response = await currentUserApi.searchUsersInCurrentOrganization(
  userFilter,
  query,
  { headers: { Authorization: `Bearer ${accessToken}` } }
);
```

### 3. **Gestion des commandes DIE (Die Orders)**
📁 `features/die/`

- ✅ Recherche des commandes DIE de l'organisation
- ✅ Récupération d'une étude de coûts (Cost Study)
- ✅ Génération de rapports de production
- ✅ Transformation des données pour la génération de rapports

**Endpoints utilisés :**
```typescript
POST /me/organization/die-orders/search
GET  /me/organization/die-orders/{id}/cost-study
POST /dies/{id}/report
```

**Fonctionnalités avancées :**
- Chargement dynamique des études de coûts
- Génération de rapports avec données quantifiées
- Interface interactive pour explorer les commandes
- Gestion du statut des commandes (FINISHED, etc.)

## 🔧 Scripts disponibles

```bash
# Vérification TypeScript sans compilation
yarn check:tsc

# Linting du code
yarn check:lint

# Vérification orthographique
yarn check:spell-checker

# Analyse du code non utilisé
yarn check:clean-code

# Génération du client API TypeScript
yarn generate:api

# Démarrer le serveur de développement
yarn start

```

## 📁 Structure du projet

```
intescia-samples/
├── features/              # Exemples d'utilisation
│   ├── login/            # Authentification OAuth2
│   │   ├── index.html    # Page de login
│   │   ├── index.ts      # Point d'entrée
│   │   └── login.ts      # Logique d'authentification
│   ├── users/            # Gestion des utilisateurs
│   │   ├── index.html    # Interface utilisateur
│   │   └── users.ts      # Logique de recherche
│   └── die/              # Gestion des commandes de découpe
│       ├── index.html    # Interface die orders
│       └── die.ts        # Logique métier
├── lib/                  # Utilitaires partagés
│   ├── back-to-home.ts   # Navigation
│   ├── build-query-params.ts
│   └── types.ts          # Types partagés
├── scripts/              # Scripts de build et génération
│   ├── generate-api.ts   # Génération du client API
│   ├── serve.ts          # Serveur de développement
│   └── check-css-properties.ts
├── generated/            # Client API auto-généré (après yarn generate:api)
│   ├── data-contracts.ts # Types de données
│   ├── http-client.ts    # Client HTTP
│   ├── CurrentUser.ts    # API CurrentUser
│   ├── MyOrganizationDieOrders.ts
│   ├── CostStudy.ts
│   └── Report.ts
├── config.ts      # Configuration OAuth2 et API
├── tsconfig.json         # Configuration TypeScript
├── vite.config.js        # Configuration Vite
├── eslint.config.js      # Configuration ESLint
└── package.json
```

## 🔐 Sécurité

- Les tokens OAuth2 sont stockés dans le localStorage
- Le refresh automatique des tokens est géré par `oidc-client-ts`
- Les credentials doivent être configurés dans `config.ts` (⚠️ ne pas committer en production)
- Utilisation de l'en-tête `Authorization: Bearer <token>` pour tous les appels API

## 📖 Génération du client API

Le projet utilise `swagger-typescript-api` pour générer automatiquement un client TypeScript typé depuis la spécification OpenAPI d'Intescia :

```bash
yarn generate:api
```

**Ce que fait le script :**
1. Récupère la spécification OpenAPI depuis l'URL configurée
2. Génère des classes TypeScript pour chaque endpoint
3. Crée des types de données complets

**Résultat :** Un dossier `generated/` contenant :
- Types de données complets et validés
- Méthodes typées pour chaque endpoint
- Client HTTP configuré
- Auto-complétion complète dans votre IDE

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Voir le fichier [LICENSE](LICENSE) pour plus de détails.
