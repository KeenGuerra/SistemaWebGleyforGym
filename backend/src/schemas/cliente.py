from datetime import date
from pydantic import BaseModel, Field
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.usuario import UsuarioResponse, UsuarioCreate

class ClienteBase(BaseModel):
    objetivo_id: int | None = Field(None, description="ID del objetivo de entrenamiento")
    peso: float | None = Field(None, gt=0, description="Peso en kg (debe ser positivo)")
    altura: float | None = Field(None, gt=0, lt=3.00, description="Altura en metros (debe ser menor a 3.00)")
    fecha_nacimiento: date | None = None
    sexo: str | None = Field(None, max_length=20)
    direccion: str | None = None
    restricciones_medicas: str | None = None
    activo: bool = True

class ClienteCreate(ClienteBase):
    usuario: UsuarioCreate

class ClienteUpdate(BaseModel):
    objetivo_id: int | None = Field(None)
    peso: float | None = Field(None, gt=0)
    altura: float | None = Field(None, gt=0, lt=3.00)
    fecha_nacimiento: date | None = None
    sexo: str | None = Field(None, max_length=20)
    direccion: str | None = None
    restricciones_medicas: str | None = None
    entrenador_id: int | None = Field(None, gt=0)
    membresia_id: int | None = Field(None, gt=0)
    activo: bool | None = None
    # Campos del usuario que se pueden actualizar a la par
    nombre: str | None = None
    apellido: str | None = None
    dni: str | None = None
    correo: str | None = None
    telefono: str | None = None

class ClienteResponse(ClienteBase):
    id: int
    usuario: UsuarioResponse
    entrenador_id: int | None = None
    nombre_entrenador: str | None = None
    membresia_id: int | None = None
    membresia_tipo: str | None = None
    membresia_estado: str | None = None
    membresia_fin: str | None = None

    class Config:
        from_attributes = True
