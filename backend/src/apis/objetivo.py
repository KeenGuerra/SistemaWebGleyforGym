from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.connection import get_db
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.security import get_current_user
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.objetivo import ObjetivoResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.objetivo_repository import objetivo_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario

router = APIRouter()

@router.get("/", response_model=list[ObjetivoResponse])
def get_objetivos(
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    """Obtiene todos los objetivos activos (para usar en formularios)."""
    return objetivo_repository.get_all(db)
