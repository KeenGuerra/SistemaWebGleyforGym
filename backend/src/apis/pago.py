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
from src.schemas.pago import PagoCreate, PagoResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.services.pago_service import pago_service
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.cliente_repository import cliente_repository

router = APIRouter()

def check_admin(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol != "ADMINISTRADOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación permitida únicamente para administradores"
        )
    return current_user

@router.get("/", response_model=list[PagoResponse])
def get_pagos(
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
        pagos = pago_service.obtener_por_cliente(db, c.id)
    else:
        pagos = pago_service.obtener_todos(db)
    return [pago_service.decorador_pago(p) for p in pagos]

@router.get("/cliente/{cliente_id}", response_model=list[PagoResponse])
def get_pagos_cliente(
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
    pagos = pago_service.obtener_por_cliente(db, cliente_id)
    return [pago_service.decorador_pago(p) for p in pagos]

@router.post("/", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
def create_pago(
    pago_in: PagoCreate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    p = pago_service.registrar_pago(db, pago_in)
    return pago_service.decorador_pago(p)
