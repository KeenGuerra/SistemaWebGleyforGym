from datetime import date
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Rutina, Ejercicio, RutinaEjercicio
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.rutina import RutinaCreate, EjercicioCreate, RutinaEjercicioCreate

class RutinaRepository:
    # --- Ejercicios ---
    def get_ejercicio_by_id(self, db: Session, ejercicio_id: int) -> Ejercicio | None:
        return db.query(Ejercicio).filter(Ejercicio.id == ejercicio_id).first()

    def get_ejercicio_by_nombre(self, db: Session, nombre: str) -> Ejercicio | None:
        return db.query(Ejercicio).filter(Ejercicio.nombre == nombre).first()

    def get_all_ejercicios(self, db: Session) -> list[Ejercicio]:
        return db.query(Ejercicio).all()

    def create_ejercicio(self, db: Session, ej_in: EjercicioCreate) -> Ejercicio:
        db_ej = Ejercicio(
            nombre=ej_in.nombre,
            descripcion=ej_in.descripcion,
            grupo_muscular_id=ej_in.grupo_muscular_id,
            nivel=ej_in.nivel,
            video_url=ej_in.video_url,
            activo=ej_in.activo
        )
        db.add(db_ej)
        db.commit()
        db.refresh(db_ej)
        return db_ej

    def update_ejercicio(self, db: Session, db_ej: Ejercicio, data: dict) -> Ejercicio:
        for field, value in data.items():
            if hasattr(db_ej, field):
                setattr(db_ej, field, value)
        db.commit()
        db.refresh(db_ej)
        return db_ej

    # --- Rutinas ---
    def get_by_id(self, db: Session, rutina_id: int) -> Rutina | None:
        return db.query(Rutina).filter(Rutina.id == rutina_id).first()

    def get_all(self, db: Session) -> list[Rutina]:
        return db.query(Rutina).all()

    def get_by_cliente(self, db: Session, cliente_id: int) -> list[Rutina]:
        return db.query(Rutina).filter(Rutina.cliente_id == cliente_id).all()

    def get_by_entrenador(self, db: Session, entrenador_id: int) -> list[Rutina]:
        return db.query(Rutina).filter(Rutina.entrenador_id == entrenador_id).all()

    def create(self, db: Session, rutina_in: RutinaCreate, entrenador_id: int) -> Rutina:
        db_rutina = Rutina(
            nombre=rutina_in.nombre,
            cliente_id=rutina_in.cliente_id,
            entrenador_id=entrenador_id,
            objetivo_id=rutina_in.objetivo_id,
            nivel=rutina_in.nivel,
            fecha_creacion=date.today(),
            activa=True,
            descripcion=rutina_in.descripcion
        )
        db.add(db_rutina)
        db.commit()
        db.refresh(db_rutina)
        return db_rutina

    def update(self, db: Session, db_rutina: Rutina, data: dict) -> Rutina:
        for field, value in data.items():
            if hasattr(db_rutina, field):
                setattr(db_rutina, field, value)
        db.commit()
        db.refresh(db_rutina)
        return db_rutina

    def desactivar(self, db: Session, db_rutina: Rutina) -> Rutina:
        db_rutina.activa = False
        db.commit()
        db.refresh(db_rutina)
        return db_rutina

    # --- Asociación de Ejercicios ---
    def agregar_ejercicio_a_rutina(
        self, db: Session, rutina_id: int, ejercicio_id: int, ej_detalles: RutinaEjercicioCreate
    ) -> RutinaEjercicio:
        db_rel = RutinaEjercicio(
            rutina_id=rutina_id,
            ejercicio_id=ejercicio_id,
            series=ej_detalles.series,
            repeticiones=ej_detalles.repeticiones,
            descanso_segundos=ej_detalles.descanso_segundos,
            dia_semana=ej_detalles.dia_semana,
            orden=ej_detalles.orden,
            notas=ej_detalles.notas
        )
        db.add(db_rel)
        db.commit()
        db.refresh(db_rel)
        return db_rel

    def limpiar_ejercicios_de_rutina(self, db: Session, rutina_id: int) -> None:
        db.query(RutinaEjercicio).filter(RutinaEjercicio.rutina_id == rutina_id).delete()
        db.commit()

rutina_repository = RutinaRepository()
