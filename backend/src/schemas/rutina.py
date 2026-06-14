from datetime import date
from pydantic import BaseModel, Field

class EjercicioBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: str | None = None

class EjercicioCreate(EjercicioBase):
    pass

class EjercicioResponse(EjercicioBase):
    id: int

    class Config:
        from_attributes = True

class RutinaEjercicioBase(BaseModel):
    series: int = Field(..., gt=0)
    repeticiones: str = Field(..., min_length=1, max_length=50)
    descanso: str = Field(..., min_length=1, max_length=50)
    notas: str | None = None

class RutinaEjercicioCreate(RutinaEjercicioBase):
    ejercicio_nombre: str = Field(..., description="Nombre del ejercicio a asociar")

class RutinaEjercicioResponse(RutinaEjercicioBase):
    id: int
    ejercicio: EjercicioResponse

    class Config:
        from_attributes = True

class RutinaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    dias_semana: list[str] = Field(..., description="Días de la semana. Ej: ['Lunes', 'Miércoles']")
    nivel: str = Field(..., pattern="^(principiante|intermedio|avanzado)$")
    objetivo: str = Field(..., min_length=1, max_length=150)
    descripcion: str | None = None

class RutinaCreate(RutinaBase):
    cliente_id: int = Field(..., gt=0)
    ejercicios: list[RutinaEjercicioCreate] = []

class RutinaUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=100)
    dias_semana: list[str] | None = None
    nivel: str | None = Field(None, pattern="^(principiante|intermedio|avanzado)$")
    objetivo: str | None = Field(None, min_length=1, max_length=150)
    descripcion: str | None = None
    activa: bool | None = None

class RutinaResponse(RutinaBase):
    id: int
    cliente_id: int
    entrenador_id: int
    fecha_creacion: date
    activa: bool
    ejercicios: list[RutinaEjercicioResponse] = []
    nombre_cliente: str | None = None

    class Config:
        from_attributes = True
