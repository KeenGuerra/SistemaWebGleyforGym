from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Entrenador, ClienteEntrenador, Cliente, Especialidad
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.entrenador import EntrenadorCreate

class EntrenadorRepository:
    def get_by_id(self, db: Session, entrenador_id: int) -> Entrenador | None:
        return db.query(Entrenador).filter(Entrenador.id == entrenador_id).first()

    def get_by_usuario_id(self, db: Session, usuario_id: int) -> Entrenador | None:
        return db.query(Entrenador).filter(Entrenador.usuario_id == usuario_id).first()

    def get_all(self, db: Session) -> list[Entrenador]:
        return db.query(Entrenador).all()

    def create(self, db: Session, user_id: int, entrenador_in: EntrenadorCreate) -> Entrenador:
        db_entrenador = Entrenador(
            usuario_id=user_id,
            experiencia_anios=entrenador_in.experiencia_anios,
            activo=True
        )
        if entrenador_in.especialidades_ids:
            esps = db.query(Especialidad).filter(Especialidad.id.in_(entrenador_in.especialidades_ids)).all()
            db_entrenador.especialidades.extend(esps)

        db.add(db_entrenador)
        db.commit()
        db.refresh(db_entrenador)
        return db_entrenador

    def update(self, db: Session, db_entrenador: Entrenador, data: dict, especialidades_ids: list[int] | None = None) -> Entrenador:
        for field, value in data.items():
            if hasattr(db_entrenador, field):
                setattr(db_entrenador, field, value)
        
        if especialidades_ids is not None:
            db_entrenador.especialidades.clear()
            esps = db.query(Especialidad).filter(Especialidad.id.in_(especialidades_ids)).all()
            db_entrenador.especialidades.extend(esps)

        db.commit()
        db.refresh(db_entrenador)
        return db_entrenador

    def get_clientes_asignados(self, db: Session, entrenador_id: int) -> list[Cliente]:
        asignaciones = db.query(ClienteEntrenador).filter(
            ClienteEntrenador.entrenador_id == entrenador_id,
            ClienteEntrenador.activo == True
        ).all()
        return [a.cliente for a in asignaciones]

entrenador_repository = EntrenadorRepository()
