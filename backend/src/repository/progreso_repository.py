from sqlalchemy.orm import Session
from src.database.models import ProgresoCliente
from src.schemas.progreso import ProgresoCreate

class ProgresoRepository:
    def get_by_id(self, db: Session, progreso_id: int) -> ProgresoCliente | None:
        return db.query(ProgresoCliente).filter(ProgresoCliente.id == progreso_id).first()

    def get_by_cliente(self, db: Session, cliente_id: int) -> list[ProgresoCliente]:
        return db.query(ProgresoCliente).filter(ProgresoCliente.cliente_id == cliente_id).order_by(ProgresoCliente.fecha.desc()).all()

    def create(self, db: Session, progreso_in: ProgresoCreate, imc: float) -> ProgresoCliente:
        db_prog = ProgresoCliente(
            cliente_id=progreso_in.cliente_id,
            fecha=progreso_in.fecha,
            peso=progreso_in.peso,
            altura=progreso_in.altura,
            imc=imc,
            porcentaje_grasa=progreso_in.porcentaje_grasa,
            porcentaje_muscular=progreso_in.porcentaje_muscular,
            notas=progreso_in.notas
        )
        db.add(db_prog)
        db.commit()
        db.refresh(db_prog)
        return db_prog

progreso_repository = ProgresoRepository()
