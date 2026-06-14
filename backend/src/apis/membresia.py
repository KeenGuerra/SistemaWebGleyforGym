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
from src.schemas.membresia import MembresiaCreate, MembresiaUpdate, MembresiaResponse, ClienteMembresiaResponse, RenovarMembresiaRequest
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.services.membresia_service import membresia_service
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.membresia_repository import membresia_repository
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

def check_admin_or_trainer(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol not in ["ADMINISTRADOR", "ENTRENADOR"]:
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

@router.put("/{membresia_id}", response_model=MembresiaResponse)
def update_membresia_catalogo_item(
    membresia_id: int,
    membresia_in: MembresiaUpdate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    return membresia_service.update_catalog_item(db, membresia_id, membresia_in)

# --- Historial y Membresía Activa de Clientes ---

@router.post("/renovar", response_model=ClienteMembresiaResponse)
def renovar_membresia_cliente(
    req: RenovarMembresiaRequest,
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    cm = membresia_service.renovar(db, req)
    return membresia_service.decorador_cliente_membresia(db, cm)

@router.get("/suscripciones/todas", response_model=list[ClienteMembresiaResponse])
def get_todas_suscripciones(
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin_or_trainer)
):
    subs = membresia_service.get_todas_suscripciones(db)
    return [membresia_service.decorador_cliente_membresia(db, sub) for sub in subs]

@router.get("/cliente/{cliente_id}/activa", response_model=ClienteMembresiaResponse)
def get_membresia_activa(
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
    cm = membresia_repository.get_cliente_membresia_activa(db, cliente_id)
    if not cm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El cliente no cuenta con una membresía activa"
        )
    return membresia_service.decorador_cliente_membresia(db, cm)

@router.get("/cliente/{cliente_id}/historial", response_model=list[ClienteMembresiaResponse])
def get_historial_membresias(
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
    historial = membresia_repository.get_cliente_membresias_all(db, cliente_id)
    return [membresia_service.decorador_cliente_membresia(db, cm) for cm in historial]
