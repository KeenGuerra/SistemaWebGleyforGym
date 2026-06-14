import os
from dotenv import load_dotenv

# Cargar archivo .env si existe
load_dotenv()

class Settings:
    PROJECT_NAME: str = "GleyforGym Backend"
    PROJECT_VERSION: str = "1.0.0"

    # Base de datos
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/gleyforgym"
    )

    # Seguridad y JWT
    # En producción esto DEBE ser una clave secreta segura y única
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 horas por defecto

settings = Settings()
