from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from sqlalchemy import text
from app.core.database import engine
from app.modules.auth.model import User
from app.modules.auth.router import router as auth_router
from app.modules.vehicles.model import Vehicle

from app.modules.vehicles.router import router as vehicle_router



app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# Allow the Vite dev server (and common local ports) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "Running",
    }





@app.get("/db-check")
def db_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"message": "Database connected successfully!"}

app.include_router(auth_router)
app.include_router(vehicle_router)