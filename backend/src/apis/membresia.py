from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.core.security import get_current_user
from src.schemas.membresia import MembresiaCreate, MembresiaResponse, ClienteMembresiaResponse, RenovarMembresiaRequest
from src.database.models import Usuario
from src.services.membresia_service import membresia_service
from src.repository.membresia_repository import membresia_repository

router = APIRouter()

def check_admin(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación permitida únicamente para administradores"
        )
    return current_user

def check_admin_or_trainer(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol not in ["admin", "entrenador"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación no permitida"
        )
    return current_user

# --- Catálogo de Membresías ---

@router.get("/", response_model=list[MembresiaResponse])
def get_membresias_catalogo(
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    return membresia_service.get_catalog_all(db)

@router.get("/{membresia_id}", response_model=MembresiaResponse)
def get_membresia_catalogo_item(
    membresia_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    return membresia_service.get_catalog_by_id(db, membresia_id)

@router.post("/", response_model=MembresiaResponse, status_code=status.HTTP_201_CREATED)
def create_membresia_catalogo_item(
    membresia_in: MembresiaCreate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    return membresia_service.create_catalog_item(db, membresia_in)

# --- Historial y Membresía Activa de Clientes ---

@router.post("/renovar", response_model=ClienteMembresiaResponse)
def renovar_membresia_cliente(
    req: RenovarMembresiaRequest,
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    cm = membresia_service.renovar(db, req)
    return membresia_service.decorador_cliente_membresia(cm)

@router.get("/cliente/{cliente_id}/activa", response_model=ClienteMembresiaResponse)
def get_membresia_activa(
    cliente_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    if user.rol == "cliente" and user.id != cliente_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para acceder a esta información"
        )
    cm = membresia_repository.get_cliente_membresia_activa(db, cliente_id)
    if not cm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El cliente no cuenta con una membresía activa"
        )
    return membresia_service.decorador_cliente_membresia(cm)

@router.get("/cliente/{cliente_id}/historial", response_model=list[ClienteMembresiaResponse])
def get_historial_membresias(
    cliente_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    if user.rol == "cliente" and user.id != cliente_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para acceder a esta información"
        )
    historial = membresia_repository.get_cliente_membresias_all(db, cliente_id)
    return [membresia_service.decorador_cliente_membresia(cm) for cm in historial]
