from datetime import date
from pydantic import BaseModel, Field

class MembresiaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=50)
    descripcion: str | None = None
    precio: float = Field(..., gt=0, description="El precio debe ser positivo")
    duracion_dias: int = Field(..., gt=0, description="La duración en días debe ser positiva")
    activa: bool = True

class MembresiaCreate(MembresiaBase):
    pass

class MembresiaUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=50)
    descripcion: str | None = None
    precio: float | None = Field(None, gt=0)
    duracion_dias: int | None = Field(None, gt=0)
    activa: bool | None = None

class MembresiaResponse(MembresiaBase):
    id: int

    class Config:
        from_attributes = True

class ClienteMembresiaBase(BaseModel):
    cliente_id: int
    membresia_id: int
    fecha_inicio: date
    fecha_fin: date
    estado: str = Field("ACTIVA", pattern="^(ACTIVA|VENCIDA|CANCELADA)$")

class ClienteMembresiaCreate(ClienteMembresiaBase):
    pass

class ClienteMembresiaUpdate(BaseModel):
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    estado: str | None = Field(None, pattern="^(ACTIVA|VENCIDA|CANCELADA)$")

class ClienteMembresiaResponse(ClienteMembresiaBase):
    id: int
    dias_restantes: int | None = None
    membresia: MembresiaResponse

    class Config:
        from_attributes = True

class RenovarMembresiaRequest(BaseModel):
    cliente_id: int = Field(..., gt=0)
    membresia_id: int = Field(..., gt=0)
    fecha_inicio: date | None = None
