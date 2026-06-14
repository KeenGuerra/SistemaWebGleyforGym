from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.entrenador_repository import entrenador_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.usuario_repository import usuario_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.cliente_repository import cliente_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.entrenador import EntrenadorCreate, EntrenadorUpdate
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.security import get_password_hash
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Entrenador, Cliente
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.exceptions import raise_not_found, raise_bad_request

class EntrenadorService:
    def get_by_id(self, db: Session, entrenador_id: int) -> Entrenador:
        entrenador = entrenador_repository.get_by_id(db, entrenador_id)
        if not entrenador:
            raise_not_found("Entrenador no encontrado")
        return entrenador

    def get_all(self, db: Session) -> list[Entrenador]:
        return entrenador_repository.get_all(db)

    def create(self, db: Session, entrenador_in: EntrenadorCreate) -> Entrenador:
        # 1. Crear usuario asociado
        existing_user = usuario_repository.get_by_correo(db, entrenador_in.usuario.correo)
        if existing_user:
            raise_bad_request("El correo electrónico ya se encuentra registrado")
        
        existing_dni = db.query(Entrenador).join(Entrenador.usuario).filter(
            Entrenador.usuario.has(dni=entrenador_in.usuario.dni)
        ).first()
        if existing_dni:
            raise_bad_request("El DNI ya se encuentra registrado")
        
        hashed_pw = get_password_hash(entrenador_in.usuario.password)
        db_user = usuario_repository.create(db, entrenador_in.usuario, hashed_pw)
        
        # 2. Crear entrenador
        return entrenador_repository.create(db, db_user.id, entrenador_in)

    def update(self, db: Session, entrenador_id: int, entrenador_in: EntrenadorUpdate) -> Entrenador:
        db_entrenador = self.get_by_id(db, entrenador_id)
        db_user = db_entrenador.usuario

        # Actualizar datos del usuario asociado si vienen
        user_updates = {}
        fields = ["nombre", "apellido", "telefono", "dni", "activo"]
        for field in fields:
            val = getattr(entrenador_in, field, None)
            if val is not None:
                user_updates[field] = val

        if entrenador_in.correo is not None:
            if entrenador_in.correo != db_user.correo:
                existing = usuario_repository.get_by_correo(db, entrenador_in.correo)
                if existing:
                    raise_bad_request("El correo electrónico ya está en uso")
            user_updates["correo"] = entrenador_in.correo

        if user_updates:
            # pyrefly: ignore [missing-import]
            # pyright: ignore [reportMissingImports]
            from src.schemas.usuario import UsuarioUpdate
            user_schema = UsuarioUpdate(**user_updates)
            usuario_repository.update(db, db_user, user_schema)

        # Actualizar especialidades y experiencia
        trainer_updates = {}
        if entrenador_in.experiencia_anios is not None:
            trainer_updates["experiencia_anios"] = entrenador_in.experiencia_anios
        if entrenador_in.activo is not None:
            trainer_updates["activo"] = entrenador_in.activo

        entrenador_repository.update(
            db, db_entrenador, trainer_updates, 
            especialidades_ids=entrenador_in.especialidades_ids
        )

        return db_entrenador

    def asignar_cliente(self, db: Session, cliente_id: int, entrenador_id: int) -> bool:
        # Verificar cliente y entrenador
        cliente = cliente_repository.get_by_id(db, cliente_id)
        if not cliente:
            raise_not_found("Cliente no encontrado")
        
        # Verificar que el entrenador existe
        self.get_by_id(db, entrenador_id)
        
        cliente_repository.asignar_entrenador(db, cliente_id, entrenador_id)
        return True

    def get_clientes_asignados(self, db: Session, entrenador_id: int) -> list[Cliente]:
        # Verificar entrenador primero
        self.get_by_id(db, entrenador_id)
        return entrenador_repository.get_clientes_asignados(db, entrenador_id)

entrenador_service = EntrenadorService()
