from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.config import settings

# En PostgreSQL, no necesitamos check_same_thread=False (eso es de SQLite)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
