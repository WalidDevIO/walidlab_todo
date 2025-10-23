# Todo App (Non authentifié)

## Features

- Interface web simple pour gérer les todos
- Base de données MongoDB pour la persistance
- Notifications Telegram pour les tâches incomplètes
- Tâche cron planifiée (quotidienne à 9h)
- Containerisation Docker

## Caractéristiques de sécurité

Cette application est volontairement **non authentifiée** :
- Aucune authentification requise pour accéder aux endpoints
- Pas de gestion d'utilisateurs
- Endpoints admin accessibles sans mot de passe

## Configuration

1. Copier `.env.example` vers `.env` et configurer :
   ```bash
   cp .env.example .env
   ```

2. Ajouter votre token de bot Telegram et chat ID dans `.env` :
   ```
   TELEGRAM_BOT_TOKEN=votre_token_bot_telegram
   TELEGRAM_CHAT_ID=votre_chat_id
   ```

3. Lancer avec Docker :
   ```bash
   docker-compose up --build
   ```

4. Accéder à l'app sur : http://localhost:3000

## Configuration Telegram Bot

1. Créer un bot via @BotFather sur Telegram
2. Copier le token du bot
3. Obtenir votre chat ID (envoyer un message au bot puis utiliser l'API pour récupérer l'ID)
4. Ajouter le bot à votre chat/canal

## Endpoints API

- `GET /` - Interface principale des todos
- `POST /add` - Ajouter un nouveau todo
- `POST /toggle/:id` - Basculer l'état de completion d'un todo
- `GET /api/todos` - Récupérer tous les todos (JSON)
- `GET /admin` - Statistiques admin (non authentifié)
- `POST /notify` - Déclencher manuellement une notification Telegram

## Programmation Cron

Les notifications sont envoyées quotidiennement à 9h00 pour les todos incomplets.