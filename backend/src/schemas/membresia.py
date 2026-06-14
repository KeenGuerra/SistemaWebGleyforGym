from datetime import date
from pydantic import BaseModel, Field

class MembresiaBase(BaseModel):
    tipo: str = Field(..., min_length=1, max_length=100)
    precio: float = Field(..., gt=0, description="El precio debe ser positivo")
    duracion_meses: int = Field(..., gt=0, description="La duración en meses debe ser positiva")
    activa: bool = True

class MembresiaCreate(MembresiaBase):
    pass

class MembresiaResponse(MembresiaBase):
    id: int

    class Config:
        from_attributes = True

class ClienteMembresiaResponse(BaseModel):
    id: int
    cliente_id: int
    membresia_id: int
    fecha_inicio: date
    fecha_fin: date
    estado: str  # 'activa', 'vencida', 'pendiente', 'suspendida'
    dias_restantes: int | None = None
    membresia: MembresiaResponse

    class Config:
        from_attributes = True

class RenovarMembresiaRequest(BaseModel):
    cliente_id: int = Field(..., gt=0)
    tipo: str = Field(..., min_length=1, max_length=100)
    precio: float = Field(..., gt=0)
    meses: int = Field(..., gt=0)
