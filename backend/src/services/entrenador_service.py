from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.repository.entrenador_repository import entrenador_repository
from src.repository.usuario_repository import usuario_repository
from src.repository.cliente_repository import cliente_repository
from src.schemas.entrenador import EntrenadorCreate, EntrenadorUpdate
from src.core.security import get_password_hash
from src.database.models import Entrenador, Cliente

class EntrenadorService:
    def get_by_id(self, db: Session, entrenador_id: int) -> Entrenador:
        entrenador = entrenador_repository.get_by_id(db, entrenador_id)
        if not entrenador:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrenador no encontrado"
            )
        return entrenador

    def get_all(self, db: Session) -> list[Entrenador]:
        return entrenador_repository.get_all(db)

    def create(self, db: Session, entrenador_in: EntrenadorCreate) -> Entrenador:
        # 1. Crear usuario asociado
        existing_user = usuario_repository.get_by_correo(db, entrenador_in.usuario.correo)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya se encuentra registrado"
            )
        
        hashed_pw = get_password_hash(entrenador_in.usuario.password)
        db_user = usuario_repository.create(db, entrenador_in.usuario, hashed_pw)
        
        # 2. Crear entrenador
        return entrenador_repository.create(db, db_user.id, entrenador_in)

    def update(self, db: Session, entrenador_id: int, entrenador_in: EntrenadorUpdate) -> Entrenador:
        db_entrenador = self.get_by_id(db, entrenador_id)
        db_user = db_entrenador.usuario

        # Actualizar datos del usuario asociado si vienen
        user_updates = {}
        if entrenador_in.nombre is not None:
            user_updates["nombre"] = entrenador_in.nombre
        if entrenador_in.apellido is not None:
            user_updates["apellido"] = entrenador_in.apellido
        if entrenador_in.telefono is not None:
            user_updates["telefono"] = entrenador_in.telefono
        if entrenador_in.correo is not None:
            if entrenador_in.correo != db_user.correo:
                existing = usuario_repository.get_by_correo(db, entrenador_in.correo)
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="El correo electrónico ya está en uso"
                    )
            user_updates["correo"] = entrenador_in.correo

        if user_updates:
            from src.schemas.usuario import UsuarioUpdate
            user_schema = UsuarioUpdate(**user_updates)
            usuario_repository.update(db, db_user, user_schema)

        # Actualizar especialidad y experiencia
        trainer_updates = {}
        if entrenador_in.especialidad is not None:
            trainer_updates["especialidad"] = entrenador_in.especialidad
        if entrenador_in.experiencia is not None:
            trainer_updates["experiencia"] = entrenador_in.experiencia

        if trainer_updates:
            entrenador_repository.update(db, db_entrenador, trainer_updates)

        return db_entrenador

    def asignar_cliente(self, db: Session, cliente_id: int, entrenador_id: int) -> bool:
        # Verificar cliente y entrenador
        cliente = cliente_repository.get_by_id(db, cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
        
        entrenador = self.get_by_id(db, entrenador_id)
        
        cliente_repository.asignar_entrenador(db, cliente_id, entrenador_id)
        return True

    def get_clientes_asignados(self, db: Session, entrenador_id: int) -> list[Cliente]:
        # Verificar entrenador primero
        self.get_by_id(db, entrenador_id)
        return entrenador_repository.get_clientes_asignados(db, entrenador_id)

entrenador_service = EntrenadorService()
