from sqlalchemy.orm import Session
from fastapi import HTTPException, status
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.usuario_repository import usuario_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.security import get_password_hash, verify_password
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.usuario import UsuarioCreate, UsuarioUpdate, CambiarPasswordRequest
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario

class UsuarioService:
    def get_by_id(self, db: Session, user_id: int) -> Usuario:
        user = usuario_repository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        return user

    def get_all(self, db: Session) -> list[Usuario]:
        return usuario_repository.get_all(db)

    def create(self, db: Session, user_in: UsuarioCreate) -> Usuario:
        # Verificar duplicado por correo
        existing = usuario_repository.get_by_correo(db, user_in.correo)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya se encuentra registrado"
            )
        
        # Verificar duplicado por DNI
        if user_in.dni:
            existing_dni = usuario_repository.get_by_dni(db, user_in.dni)
            if existing_dni:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El DNI ya se encuentra registrado"
                )
        
        hashed = get_password_hash(user_in.password)
        db_user = usuario_repository.create(db, user_in, hashed)

        if db_user.rol == "CLIENTE":
            # pyrefly: ignore [missing-import]
            from src.database.models import Cliente
            db_cliente = Cliente(
                usuario_id=db_user.id,
                objetivo_id=3,  # Tonificación por defecto
                peso=70.00,
                altura=1.70,
                activo=True
            )
            db.add(db_cliente)
            db.commit()
        elif db_user.rol == "ENTRENADOR":
            # pyrefly: ignore [missing-import]
            from src.database.models import Entrenador
            db_entrenador = Entrenador(
                usuario_id=db_user.id,
                experiencia_anios=0,
                activo=True
            )
            db.add(db_entrenador)
            db.commit()

        return db_user

    def update(self, db: Session, user_id: int, user_in: UsuarioUpdate) -> Usuario:
        db_user = self.get_by_id(db, user_id)
        
        # Si se quiere cambiar correo, verificar duplicados
        if user_in.correo and user_in.correo != db_user.correo:
            existing = usuario_repository.get_by_correo(db, user_in.correo)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El correo electrónico ya está en uso"
                )

        # Si se quiere cambiar DNI, verificar duplicados
        if user_in.dni and user_in.dni != db_user.dni:
            existing_dni = usuario_repository.get_by_dni(db, user_in.dni)
            if existing_dni:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El DNI ya está en uso"
                )
        
        hashed_pw = None
        if user_in.password:
            hashed_pw = get_password_hash(user_in.password)
            
        return usuario_repository.update(db, db_user, user_in, hashed_pw)

    def delete(self, db: Session, user_id: int) -> Usuario:
        db_user = self.get_by_id(db, user_id)
        return usuario_repository.delete_logical(db, db_user)

    def cambiar_password(self, db: Session, user_id: int, req: CambiarPasswordRequest) -> bool:
        db_user = self.get_by_id(db, user_id)
        if not verify_password(req.password_actual, db_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La contraseña actual es incorrecta"
            )
        
        new_hash = get_password_hash(req.password_nuevo)
        usuario_repository.update(db, db_user, UsuarioUpdate(), new_hash)
        return True

usuario_service = UsuarioService()
