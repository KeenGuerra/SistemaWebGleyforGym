from sqlalchemy.orm import Session
from src.database.models import Pago
from src.schemas.pago import PagoCreate

class PagoRepository:
    def get_by_id(self, db: Session, pago_id: int) -> Pago | None:
        return db.query(Pago).filter(Pago.id == pago_id).first()

    def get_all(self, db: Session) -> list[Pago]:
        return db.query(Pago).all()

    def get_by_cliente(self, db: Session, cliente_id: int) -> list[Pago]:
        return db.query(Pago).filter(Pago.cliente_id == cliente_id).order_by(Pago.fecha.desc()).all()

    def create(self, db: Session, pago_in: PagoCreate) -> Pago:
        db_pago = Pago(
            cliente_id=pago_in.cliente_id,
            monto=pago_in.monto,
            concepto=pago_in.concepto,
            metodo=pago_in.metodo,
            estado=pago_in.estado,
            comprobante=pago_in.comprobante
        )
        db.add(db_pago)
        db.commit()
        db.refresh(db_pago)
        return db_pago

pago_repository = PagoRepository()
