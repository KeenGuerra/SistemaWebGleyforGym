from datetime import date
from pydantic import BaseModel, Field

class ProgresoBase(BaseModel):
    fecha: date
    peso: float = Field(..., gt=0, description="Peso en kg (debe ser positivo)")
    altura: float = Field(..., gt=0, description="Altura en cm (debe ser positiva)")
    porcentaje_grasa: float | None = Field(None, ge=0, le=100)
    porcentaje_muscular: float | None = Field(None, ge=0, le=100)
    notas: str | None = Field(None, max_length=255)

class ProgresoCreate(ProgresoBase):
    cliente_id: int = Field(..., gt=0)

class ProgresoResponse(ProgresoBase):
    id: int
    cliente_id: int
    imc: float

    class Config:
        from_attributes = True
