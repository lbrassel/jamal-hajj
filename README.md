# Jamal vs Hajj — Setup Guide

## 1. Supabase Setup

1. Cré un projet sur [supabase.com](https://supabase.com)
2. Va dans **SQL Editor** et run le contenu de `supabase-schema.sql`
3. Va dans **Authentication → Users → Add user** et crée ton compte admin (email + password)
4. Copie ta **Project URL** et **anon key** depuis Settings → API

## 2. Variables d'environnement

Crée un fichier `.env` à la racine:
```
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ta-anon-key
```

## 3. Run en local

```bash
npm install
npm run dev
```

## 4. Deploy sur Vercel

1. Push le projet sur GitHub
2. Sur [vercel.com](https://vercel.com), importe le repo
3. Dans **Settings → Environment Variables**, ajoute:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Pages

- `/` — Page publique (tout le monde peut voir)
- `/login` — Login admin
- `/admin` — Dashboard admin (toi seul avec ton email/password)
