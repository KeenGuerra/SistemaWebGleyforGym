from datetime import date
from sqlalchemy.orm import Session
from src.database.models import Asistencia
from src.schemas.asistencia import AsistenciaCreate

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
        db_asist = Asistencia(
            cliente_id=asist_in.cliente_id,
            entrenador_id=asist_in.entrenador_id,
            fecha=asist_in.fecha,
            hora_entrada=asist_in.hora_entrada,
            hora_salida=asist_in.hora_salida,
            observaciones=asist_in.observaciones
        )
        db.add(db_asist)
        db.commit()
        db.refresh(db_asist)
        return db_asist

    def registrar_salida(self, db: Session, db_asist: Asistencia, hora_salida: str, duracion: int | None = None) -> Asistencia:
        db_asist.hora_salida = hora_salida
        if duracion is not None:
            db_asist.duracion_minutos = duracion
        db.commit()
        db.refresh(db_asist)
        return db_asist

asistencia_repository = AsistenciaRepository()
