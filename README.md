# Digital Wardrobe – Deployment Guide

This guide explains how to deploy the Digital Wardrobe app for public use with a production-ready backend API and a hosted frontend so anyone can register, upload items, and use AI suggestions.

## Overview
- Backend API: Node.js/Express, MongoDB
- Frontend: React (Create React App)
- Media: Cloudinary (recommended)
- AI: OpenAI API (configurable `OPENAI_MODEL`, default `gpt-4o-mini`)

## Prerequisites
- Cloud accounts: MongoDB Atlas, Cloudinary, hosting for backend (Railway/Render/Fly), hosting for frontend (Vercel/Netlify)
- Environment variables ready (see “Environment Variables” section)

## Environment Variables
Create environment variables in your hosting providers (do not commit secrets). Use `env.example` as reference.

Backend (.env on server):
- `MONGODB_URI` – MongoDB Atlas connection string
- `JWT_SECRET` – long random secret for tokens
- `CLOUDINARY_CLOUD_NAME` – Cloudinary cloud name
- `CLOUDINARY_API_KEY` – Cloudinary API key
- `CLOUDINARY_API_SECRET` – Cloudinary API secret
- `OPENAI_API_KEY` – OpenAI API key
- `OPENAI_MODEL` – e.g. `gpt-4o-mini` (default)
- `PORT` – provided by host or set (e.g. 8080/5000)
- `NODE_ENV` – `production`
- `CORS_ORIGIN` – frontend origin(s), comma-separated. Example: `https://your-frontend-domain.com`

Frontend (.env on frontend host):
- `REACT_APP_API_URL` – backend API base URL, e.g. `https://your-backend-host/api`

## Deploy the Backend (Railway example)
1. Create a project on Railway.
2. Deploy from GitHub repo.
3. Set environment variables (see above).
4. Ensure start command is `npm start` (uses `node server.js`).
5. Railway provides a public URL (e.g. `https://your-app.up.railway.app`).
6. Test health endpoint: `GET https://your-app.up.railway.app/api/health`.

Render/Fly/Heroku are similar: deploy Node service, set env vars, expose port.

## Set Up MongoDB Atlas
1. Create a free cluster.
2. Create a database user with a strong password.
3. Allow network access (IP whitelist or “Allow from anywhere” for testing).
4. Copy the connection string into `MONGODB_URI`.

## Configure Cloudinary
1. Create a Cloudinary account.
2. Get cloud name, API key, API secret.
3. Set them in backend environment.

## Deploy the Frontend (Vercel example)
1. Import the repo into Vercel.
2. Set `REACT_APP_API_URL` to your backend public URL + `/api`.
3. Build command: `npm run build` in `frontend/`.
   - On Vercel, set “Root Directory” to `frontend`.
4. After deploy, you get a public URL, e.g. `https://your-frontend.vercel.app`.

Netlify is similar: point to `frontend/`, run `npm run build`, publish `frontend/build`.

## CORS Configuration
On the backend, set `CORS_ORIGIN` to your frontend domain(s). Multiple origins can be comma-separated.

Examples:
- Production: `CORS_ORIGIN=https://your-frontend.vercel.app`
- Local dev: `CORS_ORIGIN=http://localhost:3000`

## Frontend → Backend Connection
- The frontend reads `REACT_APP_API_URL` at build time.
- Example production value: `https://your-app.up.railway.app/api`.

## Verification Checklist
- Health check works: `GET /api/health`
- Register/Login works
- Upload items to Cloudinary succeeds
- AI endpoints work: `POST /api/ai/suggest-outfits`, `GET /api/ai/style-recommendations`
- Outfits saved and retrievable

## Optional: Custom Domain
- Point `api.yourdomain.com` to backend hosting provider
- Point `wardrobe.yourdomain.com` to frontend hosting provider
- Update `REACT_APP_API_URL` and `CORS_ORIGIN` accordingly

## Troubleshooting
- 401 errors: token missing/expired; login again
- CORS errors: ensure `CORS_ORIGIN` matches frontend URL exactly
- Upload errors: verify Cloudinary credentials and URL usage
- DB errors: check `MONGODB_URI` and network access
- OpenAI errors: confirm `OPENAI_API_KEY` and accessible `OPENAI_MODEL`

## Scripts
- Backend: `npm start` (prod), `npm run dev` (dev)
- Frontend: `cd frontend && npm start` (dev), `cd frontend && npm run build` (prod)

You’re ready to launch publicly. Configure envs, deploy backend, deploy frontend, set CORS, and test end-to-end.

## Render Blueprint Deployment

Deploy with one click on Render using the included `render.yaml` blueprint (uses the project `Dockerfile`).

- In Render: New → Blueprint → connect your repository.
- Confirm web service settings; the blueprint sets `healthCheckPath` to `/api/health`.
- Set environment variables:
  - `NODE_ENV=production`
  - `SERVE_FRONTEND=true`
  - `PORT=5000`
  - `MONGODB_URI` (MongoDB Atlas connection string)
  - `JWT_SECRET` (random string)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `OPENAI_API_KEY` and optionally `OPENAI_MODEL` (defaults to `gpt-4o-mini` in blueprint)
  - `CORS_ORIGIN` (optional; omit for single-host same-origin)
- Deploy and wait for the health check to pass.
- Open the service URL; the frontend is served by the backend and talks to `/api` on the same origin.

Notes:
- The container exposes `5000`; Render maps it automatically.
- The frontend is built with a relative API base (`/api`).

## Railway Deployment (Single-Host)

Deploy the backend and serve the built frontend from the same origin on Railway. This project already includes a `Dockerfile` and an automatic frontend build during install.

Steps:
- Create a new project on Railway and connect your repository.
- Railway will detect the `Dockerfile` and build a container. If you opt not to use Docker, set Start Command to `npm start`.
- Set environment variables:
  - `NODE_ENV=production`
  - `SERVE_FRONTEND=true`
  - `PORT` (Railway sets this automatically; you can leave it unset)
  - `MONGODB_URI` (use your Atlas connection string)
  - `JWT_SECRET` (long random string)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `OPENAI_API_KEY` and optionally `OPENAI_MODEL`
  - `CORS_ORIGIN` (optional; omit for same-origin single-host)
- Deploy and wait for the service to become healthy.
- Verify `GET <railway-url>/api/health` returns OK, and open `<railway-url>/` to load the frontend.

Notes:
- The frontend is built automatically via the root `postinstall` and served by the backend when `SERVE_FRONTEND=true`.
- Single-host deployment removes the need for `REACT_APP_API_URL` in the frontend; it talks to `/api` on the same origin.

## Fly.io Deployment (Single-Host)

Use the included `fly.toml` to deploy the app as a single container service that serves both the backend API and the built frontend.

Steps:
- Install Fly CLI: `brew install flyctl` (macOS) or see docs.
- Create app and configure: `fly launch` (it will pick up `fly.toml`).
- Set secrets (required env vars) via CLI:
  ```bash
  fly secrets set \
    MONGODB_URI="<your-atlas-uri>" \
    JWT_SECRET="<random-string>" \
    CLOUDINARY_CLOUD_NAME="<name>" \
    CLOUDINARY_API_KEY="<key>" \
    CLOUDINARY_API_SECRET="<secret>" \
    OPENAI_API_KEY="<key>" \
    OPENAI_MODEL="gpt-4o-mini" \
    CORS_ORIGIN="https://your-frontend-domain.com"
  ```
- Deploy: `fly deploy`.
- Verify `GET <fly-app-host>/api/health` returns OK, then open `<fly-app-host>/`.

Notes:
- `fly.toml` sets `internal_port=5000`, maps to `80/443`, and adds an HTTP health check on `/api/health`.
- Frontend is built and served by backend; same-origin calls to `/api`.

## CI: Validate Docker Build on Push

This repository includes a GitHub Actions workflow to validate that the Docker image builds successfully on every push and pull request to `main`.

What it does:
- Checks out the repository
- Sets up Docker Buildx
- Builds the image using the root `Dockerfile` without pushing

Why it helps:
- Catches build failures early
- Ensures that cloud deploys (Render/Fly/Railway) will succeed
