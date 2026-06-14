from pydantic import BaseModel, Field
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.usuario import UsuarioResponse, UsuarioCreate
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.especialidad import EspecialidadResponse

class EntrenadorBase(BaseModel):
    experiencia_anios: int = Field(..., ge=0, description="Años de experiencia (no negativo)")

class EntrenadorCreate(EntrenadorBase):
    usuario: UsuarioCreate
    especialidades_ids: list[int] = Field(default=[], description="Lista de IDs de especialidades")

class EntrenadorUpdate(BaseModel):
    experiencia_anios: int | None = Field(None, ge=0)
    especialidades_ids: list[int] | None = Field(None, description="Lista de IDs de especialidades")
    # Permite también actualizar datos del usuario
    nombre: str | None = None
    apellido: str | None = None
    dni: str | None = None
    correo: str | None = None
    telefono: str | None = None
    activo: bool | None = None

class EntrenadorResponse(EntrenadorBase):
    id: int
    usuario: UsuarioResponse
    especialidades: list[EspecialidadResponse] = []

    class Config:
        from_attributes = True

class AsignarClienteRequest(BaseModel):
    cliente_id: int = Field(..., gt=0)
    entrenador_id: int = Field(..., gt=0)
