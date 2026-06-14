from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.core.security import get_current_user
from src.schemas.progreso import ProgresoCreate, ProgresoResponse
from src.database.models import Usuario
from src.services.progreso_service import progreso_service

router = APIRouter()

@router.get("/cliente/{cliente_id}", response_model=list[ProgresoResponse])
def get_progresos_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    if user.rol == "cliente" and user.id != cliente_id:
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
    # Un cliente puede registrar su propio progreso, o un admin/entrenador para cualquier cliente
    if user.rol == "cliente" and user.id != progreso_in.cliente_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para registrar progreso en esta cuenta"
        )
    return progreso_service.registrar_progreso(db, progreso_in)
