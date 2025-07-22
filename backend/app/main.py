from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.database import engine, create_tables
from app.routers import lists, items

def create_application() -> FastAPI:
    application = FastAPI(
        title="Grocery Store List API",
        description="API for managing grocery and other lists",
        version="1.0.0"
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(lists.router, prefix="/api/v1/lists", tags=["lists"])
    application.include_router(items.router, prefix="/api/v1/items", tags=["items"])

    return application

app = create_application()

@app.on_event("startup")
async def startup_event():
    create_tables()

@app.get("/")
async def root():
    return {"message": "Grocery Store List API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}