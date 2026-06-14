from datetime import date
from pydantic import BaseModel, Field

class ProgresoBase(BaseModel):
    fecha: date
    peso: float = Field(..., gt=0, description="Peso en kg (debe ser positivo)")
    altura: float = Field(..., gt=0, lt=3.00, description="Altura en metros (debe ser positiva y menor a 3.00)")
    porcentaje_grasa: float | None = Field(None, ge=0, le=100)
    porcentaje_muscular: float | None = Field(None, ge=0, le=100)
    notas: str | None = Field(None, max_length=255)

class ProgresoCreate(ProgresoBase):
    cliente_id: int = Field(..., gt=0)

class ProgresoUpdate(BaseModel):
    fecha: date | None = None
    peso: float | None = Field(None, gt=0)
    altura: float | None = Field(None, gt=0, lt=3.00)
    porcentaje_grasa: float | None = Field(None, ge=0, le=100)
    porcentaje_muscular: float | None = Field(None, ge=0, le=100)
    notas: str | None = Field(None, max_length=255)

class ProgresoResponse(ProgresoBase):
    id: int
    cliente_id: int
    imc: float

    class Config:
        from_attributes = True
