import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Pago, ClienteMembresia
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.pago import PagoCreate, PagoUpdate

class PagoRepository:
    def get_by_id(self, db: Session, pago_id: int) -> Pago | None:
        return db.query(Pago).filter(Pago.id == pago_id).first()

    def get_all(self, db: Session) -> list[Pago]:
        return db.query(Pago).all()

    def get_by_cliente(self, db: Session, cliente_id: int) -> list[Pago]:
        return db.query(Pago)\
            .join(ClienteMembresia)\
            .filter(ClienteMembresia.cliente_id == cliente_id)\
            .order_by(Pago.fecha_pago.desc())\
            .all()

    def create(self, db: Session, pago_in: PagoCreate) -> Pago:
        # Intentamos usar la función almacenada registrar_pago
        try:
            query = text("""
                SELECT registrar_pago(
                    :membresia_id, :monto, :metodo_pago, :estado, :comprobante, :observacion, :fecha_pago
                )
            """)
            fecha = pago_in.fecha_pago or datetime.date.today()
            result = db.execute(query, {
                "membresia_id": pago_in.cliente_membresia_id,
                "monto": pago_in.monto,
                "metodo_pago": pago_in.metodo_pago,
                "estado": pago_in.estado,
                "comprobante": pago_in.comprobante,
                "observacion": pago_in.observacion,
                "fecha_pago": fecha
            })
            new_id = result.scalar()
            db.commit()
            return db.query(Pago).filter(Pago.id == new_id).first()
        except Exception:
            db.rollback()
            # Fallback en caso de que no esté corriendo sobre PostgreSQL o no exista la función
            db_pago = Pago(
                cliente_membresia_id=pago_in.cliente_membresia_id,
                monto=pago_in.monto,
                fecha_pago=pago_in.fecha_pago or datetime.date.today(),
                metodo_pago=pago_in.metodo_pago,
                estado=pago_in.estado,
                comprobante=pago_in.comprobante,
                observacion=pago_in.observacion
            )
            db.add(db_pago)
            db.commit()
            db.refresh(db_pago)
            
            # Si el estado es PAGADO, activamos manualmente la membresía en el fallback
            if pago_in.estado == "PAGADO":
                db.query(ClienteMembresia)\
                    .filter(ClienteMembresia.id == pago_in.cliente_membresia_id)\
                    .update({"estado": "ACTIVA"})
                db.commit()
                
            return db_pago

    def update(self, db: Session, db_pago: Pago, data: dict) -> Pago:
        for field, value in data.items():
            if hasattr(db_pago, field):
                setattr(db_pago, field, value)
        db.commit()
        db.refresh(db_pago)
        return db_pago

pago_repository = PagoRepository()
