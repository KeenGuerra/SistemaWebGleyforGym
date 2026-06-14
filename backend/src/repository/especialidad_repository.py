from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Especialidad
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.especialidad import EspecialidadCreate

class EspecialidadRepository:
    def get_by_id(self, db: Session, especialidad_id: int) -> Especialidad | None:
        return db.query(Especialidad).filter(Especialidad.id == especialidad_id).first()

    def get_all(self, db: Session) -> list[Especialidad]:
        return db.query(Especialidad).all()

    def create(self, db: Session, esp_in: EspecialidadCreate) -> Especialidad:
        db_esp = Especialidad(
            nombre=esp_in.nombre,
            descripcion=esp_in.descripcion,
            activa=esp_in.activa
        )
        db.add(db_esp)
        db.commit()
        db.refresh(db_esp)
        return db_esp

    def update(self, db: Session, db_esp: Especialidad, data: dict) -> Especialidad:
        for field, value in data.items():
            if hasattr(db_esp, field):
                setattr(db_esp, field, value)
        db.commit()
        db.refresh(db_esp)
        return db_esp

especialidad_repository = EspecialidadRepository()
