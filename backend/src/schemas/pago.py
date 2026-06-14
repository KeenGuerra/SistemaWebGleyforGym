from datetime import date
from pydantic import BaseModel, Field

class PagoBase(BaseModel):
    monto: float = Field(..., gt=0, description="El monto debe ser positivo")
    metodo_pago: str = Field(..., pattern="^(EFECTIVO|TARJETA|TRANSFERENCIA)$")
    estado: str = Field("PAGADO", pattern="^(PAGADO|PENDIENTE|ANULADO)$")
    comprobante: str | None = None
    observacion: str | None = None

class PagoCreate(PagoBase):
    cliente_membresia_id: int = Field(..., gt=0)
    fecha_pago: date | None = None

class PagoUpdate(BaseModel):
    monto: float | None = Field(None, gt=0)
    metodo_pago: str | None = Field(None, pattern="^(EFECTIVO|TARJETA|TRANSFERENCIA)$")
    estado: str | None = Field(None, pattern="^(PAGADO|PENDIENTE|ANULADO)$")
    comprobante: str | None = None
    observacion: str | None = None
    fecha_pago: date | None = None

class PagoResponse(PagoBase):
    id: int
    cliente_membresia_id: int
    fecha_pago: date
    # Mapeo de cliente para facilitar visualización en el frontend
    cliente_id: int | None = None
    nombre_cliente: str | None = None

    class Config:
        from_attributes = True
