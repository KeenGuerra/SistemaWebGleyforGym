from datetime import date
from pydantic import BaseModel, Field

class AsistenciaBase(BaseModel):
    fecha: date
    hora_entrada: str = Field(..., description="Hora de entrada (Ej: 08:30)")
    hora_salida: str | None = Field(None, description="Hora de salida (Ej: 10:00)")
    observaciones: str | None = Field(None, max_length=255)

class AsistenciaCreate(AsistenciaBase):
    cliente_id: int = Field(..., gt=0)
    entrenador_id: int | None = Field(None, gt=0)

class AsistenciaResponse(AsistenciaBase):
    id: int
    cliente_id: int
    entrenador_id: int | None = None
    duracion_minutos: int | None = None
    nombre_cliente: str | None = None

    class Config:
        from_attributes = True
