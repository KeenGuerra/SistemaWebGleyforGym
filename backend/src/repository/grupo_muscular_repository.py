from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import GrupoMuscular
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.grupo_muscular import GrupoMuscularCreate

class GrupoMuscularRepository:
    def get_by_id(self, db: Session, gm_id: int) -> GrupoMuscular | None:
        return db.query(GrupoMuscular).filter(GrupoMuscular.id == gm_id).first()

    def get_all(self, db: Session) -> list[GrupoMuscular]:
        return db.query(GrupoMuscular).all()

    def create(self, db: Session, gm_in: GrupoMuscularCreate) -> GrupoMuscular:
        db_gm = GrupoMuscular(
            nombre=gm_in.nombre,
            descripcion=gm_in.descripcion,
            activo=gm_in.activo
        )
        db.add(db_gm)
        db.commit()
        db.refresh(db_gm)
        return db_gm

    def update(self, db: Session, db_gm: GrupoMuscular, data: dict) -> GrupoMuscular:
        for field, value in data.items():
            if hasattr(db_gm, field):
                setattr(db_gm, field, value)
        db.commit()
        db.refresh(db_gm)
        return db_gm

grupo_muscular_repository = GrupoMuscularRepository()
