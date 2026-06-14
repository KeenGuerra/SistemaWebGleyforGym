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
from src.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.services.usuario_service import usuario_service

router = APIRouter()

def check_admin(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol != "ADMINISTRADOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación permitida únicamente para administradores"
        )
    return current_user

@router.get("/", response_model=list[UsuarioResponse])
def get_usuarios(
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    return usuario_service.get_all(db)

@router.get("/{user_id}", response_model=UsuarioResponse)
def get_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    return usuario_service.get_by_id(db, user_id)

@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def create_usuario(
    user_in: UsuarioCreate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    return usuario_service.create(db, user_in)

@router.put("/{user_id}", response_model=UsuarioResponse)
def update_usuario(
    user_id: int,
    user_in: UsuarioUpdate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    return usuario_service.update(db, user_id, user_in)

@router.delete("/{user_id}", response_model=UsuarioResponse)
def delete_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    return usuario_service.delete(db, user_id)
