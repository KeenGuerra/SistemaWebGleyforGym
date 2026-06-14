from pydantic import BaseModel, Field
from src.schemas.usuario import UsuarioResponse, UsuarioCreate

class ClienteBase(BaseModel):
    objetivo: str = Field(..., min_length=1, max_length=150)
    peso: float | None = Field(None, gt=0, description="Peso en kg (debe ser positivo)")
    altura: float | None = Field(None, gt=0, description="Altura en cm (debe ser positiva)")

class ClienteCreate(ClienteBase):
    # Cuando se crea un cliente desde admin, se pueden enviar los datos del usuario en el mismo request o por separado
    usuario: UsuarioCreate

class ClienteUpdate(BaseModel):
    objetivo: str | None = Field(None, min_length=1, max_length=150)
    peso: float | None = Field(None, gt=0)
    altura: float | None = Field(None, gt=0)
    entrenador_id: int | None = Field(None, gt=0)
    membresia_id: int | None = Field(None, gt=0)
    activo: bool | None = None
    # Permite también actualizar datos del usuario
    nombre: str | None = None
    apellido: str | None = None
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
