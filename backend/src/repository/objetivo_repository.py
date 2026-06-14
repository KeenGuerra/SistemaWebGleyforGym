from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Objetivo
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.objetivo import ObjetivoCreate

class ObjetivoRepository:
    def get_by_id(self, db: Session, objetivo_id: int) -> Objetivo | None:
        return db.query(Objetivo).filter(Objetivo.id == objetivo_id).first()

    def get_all(self, db: Session) -> list[Objetivo]:
        return db.query(Objetivo).all()

    def create(self, db: Session, obj_in: ObjetivoCreate) -> Objetivo:
        db_obj = Objetivo(
            nombre=obj_in.nombre,
            descripcion=obj_in.descripcion,
            activo=obj_in.activo
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Objetivo, data: dict) -> Objetivo:
        for field, value in data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

objetivo_repository = ObjetivoRepository()
