from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.repository.pago_repository import pago_repository
from src.repository.cliente_repository import cliente_repository
from src.schemas.pago import PagoCreate, PagoResponse
from src.database.models import Pago

class PagoService:
    def registrar_pago(self, db: Session, pago_in: PagoCreate) -> Pago:
        # Validar monto positivo
        if pago_in.monto <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El monto del pago debe ser mayor a cero"
            )
            
        # Validar cliente
        cliente = cliente_repository.get_by_id(db, pago_in.cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
            
        return pago_repository.create(db, pago_in)

    def obtener_todos(self, db: Session) -> list[Pago]:
        return pago_repository.get_all(db)

    def obtener_por_cliente(self, db: Session, cliente_id: int) -> list[Pago]:
        # Validar cliente
        cliente = cliente_repository.get_by_id(db, cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
        return pago_repository.get_by_cliente(db, cliente_id)

    def decorador_pago(self, p: Pago) -> PagoResponse:
        u = p.cliente.usuario
        return PagoResponse(
            id=p.id,
            cliente_id=p.cliente_id,
            monto=p.monto,
            fecha=p.fecha,
            concepto=p.concepto,
            metodo=p.metodo,
            estado=p.estado,
            comprobante=p.comprobante,
            nombre_cliente=f"{u.nombre} {u.apellido}"
        )

pago_service = PagoService()
