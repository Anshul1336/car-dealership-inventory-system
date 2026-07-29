from fastapi import FastAPI

from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "Running",
    }



from sqlalchemy import text

from app.core.database import engine

@app.get("/db-check")
def db_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"message": "Database connected successfully!"}