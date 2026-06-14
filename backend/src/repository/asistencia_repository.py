from datetime import date, time
from sqlalchemy.orm import Session
from sqlalchemy import text
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Asistencia
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.asistencia import AsistenciaCreate, AsistenciaUpdate

class AsistenciaRepository:
    def get_by_id(self, db: Session, asistencia_id: int) -> Asistencia | None:
        return db.query(Asistencia).filter(Asistencia.id == asistencia_id).first()

    def get_all(self, db: Session) -> list[Asistencia]:
        return db.query(Asistencia).all()

    def get_by_cliente(self, db: Session, cliente_id: int) -> list[Asistencia]:
        return db.query(Asistencia).filter(Asistencia.cliente_id == cliente_id).order_by(Asistencia.fecha.desc()).all()

    def get_by_fecha(self, db: Session, target_fecha: date) -> list[Asistencia]:
        return db.query(Asistencia).filter(Asistencia.fecha == target_fecha).all()

    def create(self, db: Session, asist_in: AsistenciaCreate) -> Asistencia:
        # Intentamos usar la función almacenada registrar_asistencia
        try:
            query = text("""
                SELECT registrar_asistencia(
                    :cliente_id, :entrenador_id, :hora_entrada, :hora_salida, :estado, :observaciones, :fecha
                )
            """)
            result = db.execute(query, {
                "cliente_id": asist_in.cliente_id,
                "entrenador_id": asist_in.entrenador_id,
                "hora_entrada": asist_in.hora_entrada,
                "hora_salida": asist_in.hora_salida,
                "estado": asist_in.estado,
                "observaciones": asist_in.observaciones,
                "fecha": asist_in.fecha
            })
            new_id = result.scalar()
            db.commit()
            return db.query(Asistencia).filter(Asistencia.id == new_id).first()
        except Exception:
            db.rollback()
            # Fallback en caso de que no esté corriendo sobre PostgreSQL o no exista la función
            db_asist = Asistencia(
                cliente_id=asist_in.cliente_id,
                entrenador_id=asist_in.entrenador_id,
                fecha=asist_in.fecha,
                hora_entrada=asist_in.hora_entrada,
                hora_salida=asist_in.hora_salida,
                estado=asist_in.estado,
                observaciones=asist_in.observaciones
            )
            db.add(db_asist)
            db.commit()
            db.refresh(db_asist)
            return db_asist

    def update(self, db: Session, db_asist: Asistencia, data: dict) -> Asistencia:
        for field, value in data.items():
            if hasattr(db_asist, field):
                setattr(db_asist, field, value)
        db.commit()
        db.refresh(db_asist)
        return db_asist

    def registrar_salida(self, db: Session, db_asist: Asistencia, hora_salida: time) -> Asistencia:
        db_asist.hora_salida = hora_salida
        db.commit()
        db.refresh(db_asist)
        return db_asist

asistencia_repository = AsistenciaRepository()
