# Project Manager — Frontend

React + Vite app for the project portfolio manager. Talks to the **Backend** API for shared team data.

## Quick Start

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev:all
```

- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:8000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Frontend only |
| `npm run dev:backend` | Backend only |
| `npm run dev:all` | Frontend + Backend together |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Environment

```env
# .env — local development (uses Vite proxy)
VITE_API_URL=/api

# Production — point to your deployed Backend
# VITE_API_URL=https://your-backend.com/api
```

## Deploy (Vercel / Netlify)

1. Set project root to **`Frontend`**
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` to your Backend URL

See `../Backend/README.md` for API deployment.

## Structure

```
Frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   └── types/
├── index.html
├── vite.config.ts
└── package.json
```
