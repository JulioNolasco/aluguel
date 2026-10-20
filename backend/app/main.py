import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routes.auth import router as auth_router
from app.routes.consoles import router as consoles_router
from app.routes.accessories import router as accessories_router
from app.routes.bookings import router as bookings_router
from app.routes.inspections import router as inspections_router
from app.routes.documents import router as documents_router
from app.routes.financial import router as financial_router
from app.seed_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo data
    print("🚀 Iniciando aplicação PlayLoc PS5...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    print("🛑 Encerrando aplicação PlayLoc...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API do Sistema Web de Gestão e Locação de PlayStation 5",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(consoles_router, prefix=settings.API_V1_STR)
app.include_router(accessories_router, prefix=settings.API_V1_STR)
app.include_router(bookings_router, prefix=settings.API_V1_STR)
app.include_router(inspections_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(financial_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@app.get("/")
def root():
    return {
        "message": f"Bem-vindo à API {settings.PROJECT_NAME}",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }
