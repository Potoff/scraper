# Local Business Email Scraper - TODO

## Core Features
- [x] Schéma de base de données pour les résultats de scraping
- [ ] API de scraping SERP pour rechercher des entreprises par département et secteur
- [x] Extraction d'adresses e-mail publiques depuis les sites web
- [x] Interface utilisateur pour saisir département et secteur
- [x] Affichage des résultats en tableau
- [x] Export des résultats en CSV
- [x] Gestion de l'historique des recherches

## UI/UX
- [x] Design de la page d'accueil
- [x] Formulaire de recherche (département + secteur)
- [x] Page de résultats avec tableau
- [x] Bouton d'export CSV
- [x] Gestion des états de chargement
- [x] Messages d'erreur et feedback utilisateur

## Backend
- [x] Procédure tRPC pour lancer une recherche
- [x] Procédure tRPC pour récupérer l'historique
- [x] Procédure tRPC pour récupérer les résultats
- [ ] Intégration avec API de scraping/SERP (à implémenter avec API réelle)
- [x] Extraction d'e-mails depuis les pages web

## Infrastructure
- [x] Configuration des variables d'environnement
- [ ] Tests des procédures tRPC
- [ ] Optimisation des performances
