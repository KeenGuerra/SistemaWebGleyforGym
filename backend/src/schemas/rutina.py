from datetime import date
from pydantic import BaseModel, Field
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.grupo_muscular import GrupoMuscularResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.objetivo import ObjetivoResponse

class EjercicioBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: str | None = None
    grupo_muscular_id: int | None = None
    nivel: str | None = Field(None, max_length=50)
    video_url: str | None = Field(None)
    activo: bool = True

class EjercicioCreate(EjercicioBase):
    pass

class EjercicioUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=100)
    descripcion: str | None = None
    grupo_muscular_id: int | None = None
    nivel: str | None = None
    video_url: str | None = None
    activo: bool | None = None

class EjercicioResponse(EjercicioBase):
    id: int
    grupo_muscular: GrupoMuscularResponse | None = None

    class Config:
        from_attributes = True

class RutinaEjercicioBase(BaseModel):
    series: int = Field(..., gt=0)
    repeticiones: str = Field(..., min_length=1, max_length=50)
    descanso_segundos: int = Field(..., ge=0)
    dia_semana: str = Field(..., min_length=1, max_length=50)
    orden: int = Field(..., ge=0)
    notas: str | None = None

class RutinaEjercicioCreate(RutinaEjercicioBase):
    ejercicio_id: int = Field(..., gt=0, description="ID del ejercicio a asociar")

class RutinaEjercicioResponse(RutinaEjercicioBase):
    id: int
    ejercicio_id: int
    ejercicio: EjercicioResponse

    class Config:
        from_attributes = True

class RutinaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    nivel: str = Field(..., pattern="^(principiante|intermedio|avanzado)$")
    descripcion: str | None = None
    objetivo_id: int | None = None

class RutinaCreate(RutinaBase):
    cliente_id: int = Field(..., gt=0)
    ejercicios: list[RutinaEjercicioCreate] = []

class RutinaUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=100)
    nivel: str | None = Field(None, pattern="^(principiante|intermedio|avanzado)$")
    descripcion: str | None = None
    objetivo_id: int | None = None
    activa: bool | None = None
    ejercicios: list[RutinaEjercicioCreate] | None = None

class RutinaResponse(RutinaBase):
    id: int
    cliente_id: int
    entrenador_id: int
    fecha_creacion: date
    activa: bool
    ejercicios: list[RutinaEjercicioResponse] = []
    nombre_cliente: str | None = None
    objetivo: ObjetivoResponse | None = None

    class Config:
        from_attributes = True
