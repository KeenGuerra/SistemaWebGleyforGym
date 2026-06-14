from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.connection import get_db
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.security import get_current_user
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.asistencia import AsistenciaCreate, AsistenciaResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.services.asistencia_service import asistencia_service
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.cliente_repository import cliente_repository

router = APIRouter()

class RegistrarSalidaRequest(BaseModel):
    hora_salida: str = Field(..., description="Hora de salida en formato HH:MM")

def check_admin_or_trainer(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol not in ["ADMINISTRADOR", "ENTRENADOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación no permitida"
        )
    return current_user

@router.get("/", response_model=list[AsistenciaResponse])
def get_asistencias(
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    asistencias = asistencia_service.obtener_todas(db)
    return [asistencia_service.decorador_asistencia(a) for a in asistencias]

@router.get("/cliente/{cliente_id}", response_model=list[AsistenciaResponse])
def get_asistencias_cliente(
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
    asistencias = asistencia_service.obtener_por_cliente(db, cliente_id)
    return [asistencia_service.decorador_asistencia(a) for a in asistencias]

@router.get("/fecha/{target_fecha}", response_model=list[AsistenciaResponse])
def get_asistencias_fecha(
    target_fecha: date,
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    asistencias = asistencia_service.obtener_por_fecha(db, target_fecha)
    return [asistencia_service.decorador_asistencia(a) for a in asistencias]

@router.post("/entrada", response_model=AsistenciaResponse, status_code=status.HTTP_201_CREATED)
def registrar_entrada(
    asist_in: AsistenciaCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    a = asistencia_service.registrar_entrada(db, asist_in)
    return asistencia_service.decorador_asistencia(a)

@router.put("/{asistencia_id}/salida", response_model=AsistenciaResponse)
def registrar_salida(
    asistencia_id: int,
    req: RegistrarSalidaRequest,
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    a = asistencia_service.registrar_salida(db, asistencia_id, req.hora_salida)
    return asistencia_service.decorador_asistencia(a)
