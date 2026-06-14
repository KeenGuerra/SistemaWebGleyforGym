from pydantic import BaseModel, Field
from src.schemas.usuario import UsuarioResponse, UsuarioCreate

class EntrenadorBase(BaseModel):
    especialidad: str = Field(..., min_length=1, max_length=150)
    experiencia: int = Field(..., ge=0, description="Años de experiencia (no negativo)")

class EntrenadorCreate(EntrenadorBase):
    usuario: UsuarioCreate

class EntrenadorUpdate(BaseModel):
    especialidad: str | None = Field(None, min_length=1, max_length=150)
    experiencia: int | None = Field(None, ge=0)
    # Permite también actualizar datos del usuario
    nombre: str | None = None
    apellido: str | None = None
    correo: str | None = None
    telefono: str | None = None

class EntrenadorResponse(EntrenadorBase):
    id: int
    usuario: UsuarioResponse

    class Config:
        from_attributes = True

class AsignarClienteRequest(BaseModel):
    cliente_id: int = Field(..., gt=0)
    entrenador_id: int = Field(..., gt=0)
