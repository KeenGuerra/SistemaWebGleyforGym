from datetime import date
from pydantic import BaseModel, EmailStr, Field

class UsuarioBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=80)
    apellido: str = Field(..., min_length=1, max_length=80)
    dni: str = Field(..., min_length=8, max_length=12)
    correo: EmailStr = Field(..., max_length=120)
    telefono: str = Field(..., min_length=7, max_length=15)
    rol: str = Field("CLIENTE", pattern="^(ADMINISTRADOR|ENTRENADOR|CLIENTE)$")
    activo: bool = True
    avatar: str | None = None

class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=8)

class UsuarioUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=80)
    apellido: str | None = Field(None, min_length=1, max_length=80)
    dni: str | None = Field(None, min_length=8, max_length=12)
    correo: EmailStr | None = Field(None, max_length=120)
    telefono: str | None = Field(None, min_length=7, max_length=15)
    rol: str | None = Field(None, pattern="^(ADMINISTRADOR|ENTRENADOR|CLIENTE)$")
    activo: bool | None = None
    avatar: str | None = None
    password: str | None = Field(None, min_length=8)

class UsuarioResponse(UsuarioBase):
    id: int
    fecha_registro: date

    class Config:
        from_attributes = True

class CambiarPasswordRequest(BaseModel):
    password_actual: str
    password_nuevo: str = Field(..., min_length=8)
