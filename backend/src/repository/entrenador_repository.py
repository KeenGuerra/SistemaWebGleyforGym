from sqlalchemy.orm import Session
from src.database.models import Entrenador, ClienteEntrenador, Cliente
from src.schemas.entrenador import EntrenadorBase

class EntrenadorRepository:
    def get_by_id(self, db: Session, entrenador_id: int) -> Entrenador | None:
        return db.query(Entrenador).filter(Entrenador.id == entrenador_id).first()

    def get_all(self, db: Session) -> list[Entrenador]:
        return db.query(Entrenador).all()

    def create(self, db: Session, user_id: int, entrenador_in: EntrenadorBase) -> Entrenador:
        db_entrenador = Entrenador(
            id=user_id,
            especialidad=entrenador_in.especialidad,
            experiencia=entrenador_in.experiencia
        )
        db.add(db_entrenador)
        db.commit()
        db.refresh(db_entrenador)
        return db_entrenador

    def update(self, db: Session, db_entrenador: Entrenador, data: dict) -> Entrenador:
        for field, value in data.items():
            if hasattr(db_entrenador, field):
                setattr(db_entrenador, field, value)
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
