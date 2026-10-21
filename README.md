# PAK Hardware Store (Double-H Marketplace)

One repository, two apps. Each deploys as its own Vercel project.

| Folder | What it is | Vercel "Root Directory" | Live URL |
|---|---|---|---|
| `backend/` | Node.js + Express API (Neon PostgreSQL) | `backend` | double-h-marketplace.vercel.app |
| `frontend/` | React website (Create React App) | `frontend` | double-h-marketplace-frontend.vercel.app |

## Run locally
```
cd backend && npm install && cp .env.example .env   # fill in the values, then: npm start
cd frontend && npm install && cp .env.example .env  # then: npm start
```

## Environment variables
Real secrets live only in `.env` files (git-ignored) and in the Vercel project settings.
See `backend/.env.example` and `frontend/.env.example` for the names.

Other folders: `ApiTester(REACT)` and `frontend-test` are small API test tools, not part of the deployment.
