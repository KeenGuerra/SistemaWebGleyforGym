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
from src.schemas.auth import LoginRequest, TokenResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.usuario import UsuarioResponse, CambiarPasswordRequest
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.services.auth_service import auth_service
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.services.usuario_service import usuario_service

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    result = auth_service.login(db, req)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de acceso incorrectas o usuario inactivo"
        )
    return result

@router.get("/me", response_model=UsuarioResponse)
def read_current_user(current_user: Usuario = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(
    req: CambiarPasswordRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = usuario_service.cambiar_password(db, current_user.id, req)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo cambiar la contraseña"
        )
    return {"message": "Contraseña cambiada exitosamente"}
