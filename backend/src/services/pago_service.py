from sqlalchemy.orm import Session
from fastapi import HTTPException, status
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.pago_repository import pago_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import ClienteMembresia, Pago
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.pago import PagoCreate, PagoResponse

class PagoService:
    def registrar_pago(self, db: Session, pago_in: PagoCreate) -> Pago:
        # Validar monto positivo
        if pago_in.monto <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El monto del pago debe ser mayor a cero"
            )
            
        # Validar membresía del cliente
        sub = db.query(ClienteMembresia).filter(ClienteMembresia.id == pago_in.cliente_membresia_id).first()
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Suscripción de membresía no encontrada"
            )
            
        return pago_repository.create(db, pago_in)

    def obtener_todos(self, db: Session) -> list[Pago]:
        return pago_repository.get_all(db)

    def obtener_por_cliente(self, db: Session, cliente_id: int) -> list[Pago]:
        # Validar cliente
        # pyrefly: ignore [missing-import]
        # pyright: ignore [reportMissingImports]
        from src.repository.cliente_repository import cliente_repository
        cliente = cliente_repository.get_by_id(db, cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
        return pago_repository.get_by_cliente(db, cliente_id)

    def decorador_pago(self, p: Pago) -> PagoResponse:
        sub = p.cliente_membresia
        cli = sub.cliente
        u = cli.usuario
        return PagoResponse(
            id=p.id,
            cliente_membresia_id=p.cliente_membresia_id,
            cliente_id=cli.id,
            monto=float(p.monto),
            fecha_pago=p.fecha_pago,
            metodo_pago=p.metodo_pago,
            estado=p.estado,
            comprobante=p.comprobante,
            observacion=p.observacion,
            nombre_cliente=f"{u.nombre} {u.apellido}"
        )

pago_service = PagoService()
