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
from src.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.services.cliente_service import cliente_service

router = APIRouter()

def check_admin_or_trainer(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol not in ["ADMINISTRADOR", "ENTRENADOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación no permitida para el rol de cliente"
        )
    return current_user

def check_admin(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol != "ADMINISTRADOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación permitida únicamente para administradores"
        )
    return current_user

@router.get("/", response_model=list[ClienteResponse])
def get_clientes(
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
        return [cliente_service.decorador_cliente(db, c)]
    else:
        clientes = cliente_service.get_all(db)
        return [cliente_service.decorador_cliente(db, c) for c in clientes]

@router.get("/{cliente_id}", response_model=ClienteResponse)
def get_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    c = cliente_service.get_by_id(db, cliente_id)
    if user.rol == "CLIENTE" and c.usuario_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para acceder a esta información"
        )
    return cliente_service.decorador_cliente(db, c)

@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def create_cliente(
    cliente_in: ClienteCreate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    c = cliente_service.create(db, cliente_in)
    return cliente_service.decorador_cliente(db, c)

@router.put("/{cliente_id}", response_model=ClienteResponse)
def update_cliente(
    cliente_id: int,
    cliente_in: ClienteUpdate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    c = cliente_service.get_by_id(db, cliente_id)
    if user.rol == "CLIENTE" and c.usuario_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para modificar este perfil"
        )
    c = cliente_service.update(db, cliente_id, cliente_in)
    return cliente_service.decorador_cliente(db, c)

@router.delete("/{cliente_id}", response_model=ClienteResponse)
def delete_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    c = cliente_service.delete(db, cliente_id)
    return cliente_service.decorador_cliente(db, c)
