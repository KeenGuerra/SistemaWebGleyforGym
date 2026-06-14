from datetime import date
from pydantic import BaseModel, Field

class PagoBase(BaseModel):
    monto: float = Field(..., gt=0, description="El monto debe ser positivo")
    concepto: str = Field(..., min_length=1, max_length=200)
    metodo: str = Field(..., pattern="^(efectivo|tarjeta|transferencia)$")
    estado: str = Field("pagado", pattern="^(pagado|pendiente|cancelado)$")
    comprobante: str | None = None

class PagoCreate(PagoBase):
    cliente_id: int = Field(..., gt=0)

class PagoResponse(PagoBase):
    id: int
    cliente_id: int
    fecha: date
    nombre_cliente: str | None = None

    class Config:
        from_attributes = True
