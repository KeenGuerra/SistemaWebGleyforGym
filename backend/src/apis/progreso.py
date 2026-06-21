from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.connection import get_db
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.security import get_current_user
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.progreso import ProgresoCreate, ProgresoResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.services.progreso_service import progreso_service
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.cliente_repository import cliente_repository

router = APIRouter()

@router.get("/", response_model=list[ProgresoResponse])
def get_progresos(
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    if user.rol == "CLIENTE":
        c = cliente_repository.get_by_usuario_id(db, user.id)
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil de cliente no encontrado"
            )
        return progreso_service.obtener_por_cliente(db, c.id)
    return progreso_service.obtener_todos(db)

@router.get("/cliente/{cliente_id}", response_model=list[ProgresoResponse])
def get_progresos_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    c = cliente_repository.get_by_id(db, cliente_id)
    if not c:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    if user.rol == "CLIENTE" and c.usuario_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para acceder a esta información"
        )
    return progreso_service.obtener_por_cliente(db, cliente_id)

@router.post("/", response_model=ProgresoResponse, status_code=status.HTTP_201_CREATED)
def create_progreso(
    progreso_in: ProgresoCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    c = cliente_repository.get_by_id(db, progreso_in.cliente_id)
    if not c:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    # Un cliente puede registrar su propio progreso, o un admin/entrenador para cualquier cliente
    if user.rol == "CLIENTE" and c.usuario_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para registrar progreso en esta cuenta"
        )
    return progreso_service.registrar_progreso(db, progreso_in)
