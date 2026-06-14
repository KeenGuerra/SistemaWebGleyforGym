from sqlalchemy.orm import Session
from src.database.models import Usuario
from src.schemas.usuario import UsuarioCreate, UsuarioUpdate

class UsuarioRepository:
    def get_by_id(self, db: Session, user_id: int) -> Usuario | None:
        return db.query(Usuario).filter(Usuario.id == user_id).first()

    def get_by_correo(self, db: Session, correo: str) -> Usuario | None:
        return db.query(Usuario).filter(Usuario.correo == correo).first()

    def get_all(self, db: Session) -> list[Usuario]:
        return db.query(Usuario).all()

    def create(self, db: Session, user_in: UsuarioCreate, password_hash: str) -> Usuario:
        db_user = Usuario(
            nombre=user_in.nombre,
            apellido=user_in.apellido,
            correo=user_in.correo,
            telefono=user_in.telefono,
            password_hash=password_hash,
            rol=user_in.rol,
            activo=user_in.activo,
            avatar=user_in.avatar
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def update(self, db: Session, db_user: Usuario, user_in: UsuarioUpdate, password_hash: str | None = None) -> Usuario:
        update_data = user_in.model_dump(exclude_unset=True)
        if "password" in update_data:
            del update_data["password"]
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        if password_hash:
            db_user.password_hash = password_hash
            
        db.commit()
        db.refresh(db_user)
        return db_user

    def delete_logical(self, db: Session, db_user: Usuario) -> Usuario:
        db_user.activo = False
        db.commit()
        db.refresh(db_user)
        return db_user

usuario_repository = UsuarioRepository()
