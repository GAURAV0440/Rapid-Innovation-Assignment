from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# DB: load models + create tables on startup
from app.db.session import Base, engine
import app.db.base  # noqa: F401 (imports models so Base.metadata is populated)

# Routers
from app.api import auth, search, image, dashboard

app = FastAPI(title="AI Content & Image Explorer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables automatically (no Alembic for this assignment)
@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

# routes
app.include_router(auth.router)
app.include_router(search.router)
app.include_router(image.router)
app.include_router(dashboard.router)

@app.get("/health")
def health():
    return {"status": "ok"}
