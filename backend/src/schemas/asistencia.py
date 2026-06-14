from datetime import date
from pydantic import BaseModel, Field

class AsistenciaBase(BaseModel):
    fecha: date
    hora_entrada: str = Field(..., description="Hora de entrada (Ej: 08:30)")
    hora_salida: str | None = Field(None, description="Hora de salida (Ej: 10:00)")
    estado: str = Field("ASISTIO", pattern="^(ASISTIO|TARDE|FALTA)$")
    observaciones: str | None = Field(None, max_length=255)

class AsistenciaCreate(AsistenciaBase):
    cliente_id: int = Field(..., gt=0)
    entrenador_id: int | None = Field(None, gt=0)

class AsistenciaUpdate(BaseModel):
    hora_entrada: str | None = None
    hora_salida: str | None = None
    estado: str | None = Field(None, pattern="^(ASISTIO|TARDE|FALTA)$")
    observaciones: str | None = None

class AsistenciaResponse(AsistenciaBase):
    id: int
    cliente_id: int
    entrenador_id: int | None = None
    nombre_cliente: str | None = None

    class Config:
        from_attributes = True
