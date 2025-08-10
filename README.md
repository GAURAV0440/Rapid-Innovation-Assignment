# AI-Powered Content & Image Explorer

A full-stack app where users can **search the web** and **generate images**, then **save/manage** results in a personal dashboard. Secure login with JWT. Built for the Rapid Innovation assignment.

---

## ✨ Features
- Email/password **Register/Login**
- **Search** summaries via MCP web search server
- **Image generation** via MCP image server
- **Dashboard** to view, filter, edit, delete saved entries
- **JWT-protected API** (access + refresh tokens planned)
- React + Tailwind UI (dark mode toggle)
- FastAPI docs at `/docs`

> Note: Tests (unit/integration/E2E) are planned per the assignment.

---

## 🧱 Tech Stack
- **Frontend:** React (Vite) + TypeScript + Tailwind
- **Backend:** FastAPI (Python)
- **DB:** PostgreSQL (SQLAlchemy/Alembic)
- **MCP Servers:**  
  - Web Search: `tavily-mcp`  
  - Image Gen: `flux-imagegen-mcp-server`

---

## 📁 Project Structure
<img width="503" height="431" alt="image" src="https://github.com/user-attachments/assets/14a1f1ef-cc03-4c79-be3e-40a8bb2d719c" />


---

## 🚀 Quick Start

### 0) Prerequisites
- Python 3.10+
- Node 18+
- PostgreSQL 14+ (running locally)

### 1) Clone
git clone https://github.com/GAURAV0440/Rapid-Innovation-Assignment.git
cd Rapid-Innovation-Assignment

### 2) Backend (FastAPI)
# create and activate venv (example)
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# install deps
pip install -r backend/requirements.txt

# env
cp backend/.env.example backend/.env
# edit backend/.env with your values (DB URL, secrets, MCP URLs)

# run API
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Open http://localhost:8000/health  => {"status": "ok"}
# Open http://localhost:8000/docs    => Swagger UI


### Postgres (quick setup)

-- in psql as superuser (example)
CREATE ROLE ace_user WITH LOGIN PASSWORD 'ace_pass';
ALTER ROLE ace_user CREATEDB;
CREATE DATABASE ai_content_explorer OWNER ace_user;

Then set in backend/.env:
DATABASE_URL=postgresql+psycopg://qwertyujikolp/ai_content_explorer

### 3) Frontend (React + Vite)

cd ../frontend
cp .env.example .env
# set API base (if different)
# VITE_API_BASE_URL=http://localhost:8000

npm install
npm run dev
# Open http://localhost:5173


### MCP Servers (required)
Set these in backend/.env (already in .env.example):

TAVILY_MCP_URL=https://smithery.ai/s
FLUX_MCP_URL=https://smithery.ai/server/@f
TAVILY_API_KEY=replace_if_required


### 🔐 Auth Flow
On login, backend returns {access_token, (refresh_token), role}.

Frontend stores tokens in localStorage and attaches Authorization: Bearer <token> to API calls.

Refresh endpoint /auth/refresh issues a new access token (to be enabled).

## 🌐 API Endpoints (contract)
POST /auth/register → {message:"ok"}

POST /auth/login → {access_token, refresh_token?, role, token_type}

POST /auth/refresh → {access_token, token_type} (planned)

POST /search {query} → {id, query, results:[{title,url,summary}], created_at}

POST /image {prompt} → {id, prompt, images:[{url,meta}], created_at}

GET /dashboard?type=(all|search|image)&q=...&page=1&from=...&to=...

PATCH /dashboard/:id {title?, notes?} → {ok:true}

DELETE /dashboard/:id → {ok:true}

## 🖥️ How to Use
Register → Login

Go to Search page → enter query → save result

Go to Image page → enter prompt → generate & save

Open Dashboard → filter, view details, edit notes/title, delete items

## 🧪 Testing (per assignment)
Planned:

Unit tests (auth utils, validators, repos)

Integration tests (MCP calls)

E2E (Playwright) login → search → save → image → dashboard CRUD

Target: single command runner (e.g., make test or ./scripts/test_all.sh).

## 📦 Environment Variables
Backend (backend/.env):
APP_ENV=dev
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_URL=postgresql+psycopg://USER:PASS@localhost:5432/ai_content_explorer
JWT_SECRET=change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_SECRET=change-refresh
REFRESH_TOKEN_EXPIRE_MINUTES=43200
TAVILY_MCP_URL=...
FLUX_MCP_URL=...
TAVILY_API_KEY=...

## Frontend (frontend/.env):
VITE_API_BASE_URL=http://localhost:8000
Do not commit real .env files. Only commit .env.example.
