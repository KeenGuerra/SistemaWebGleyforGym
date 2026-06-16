from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.connection import get_db
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.security import get_current_user, get_password_hash
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.auth import LoginRequest, TokenResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.usuario import UsuarioResponse, CambiarPasswordRequest, UsuarioCreate
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.services.auth_service import auth_service
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.services.usuario_service import usuario_service
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.usuario_repository import usuario_repository

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

@router.post("/register", response_model=UsuarioResponse)
def register_cliente(
    usuario_in: UsuarioCreate,
    db: Session = Depends(get_db)
):
    # Generar un DNI aleatorio si viene vacío
    if not usuario_in.dni:
        import random
        # Generar un DNI aleatorio y verificar que no esté duplicado
        for _ in range(10):
            temp_dni = "".join(random.choices("0123456789", k=10))
            if not usuario_repository.get_by_dni(db, temp_dni):
                usuario_in.dni = temp_dni
                break
        else:
            usuario_in.dni = "".join(random.choices("0123456789", k=10))
    else:
        # Verificar duplicado si fue provisto
        existing_dni = usuario_repository.get_by_dni(db, usuario_in.dni)
        if existing_dni:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El DNI ya se encuentra registrado"
            )
    
    # Crear el usuario con rol CLIENTE
    usuario_in.rol = "CLIENTE"
    existing_user = usuario_repository.get_by_correo(db, usuario_in.correo)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado"
        )
    
    hashed_pw = get_password_hash(usuario_in.password)
    db_user = usuario_repository.create(db, usuario_in, hashed_pw)
    
    # Crear registro de cliente asociado
    # pyrefly: ignore [missing-import]
    from src.schemas.cliente import ClienteCreate
    # pyrefly: ignore [missing-import]
    from src.repository.cliente_repository import cliente_repository
    cliente_in = ClienteCreate(
        usuario=usuario_in,
        objetivo_id=3, # Tonificación por defecto
        peso=70.0,
        altura=1.70,
        activo=True
    )
    cliente_repository.create(db, db_user.id, cliente_in)
    
    return db_user

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
