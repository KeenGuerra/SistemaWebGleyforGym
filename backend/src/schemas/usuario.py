from datetime import date
from pydantic import BaseModel, EmailStr, Field

class UsuarioBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)
    correo: EmailStr
    telefono: str = Field(..., min_length=7, max_length=20)
    rol: str = Field("cliente", pattern="^(admin|entrenador|cliente)$")
    activo: bool = True
    avatar: str | None = None

class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=8)

class UsuarioUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=100)
    apellido: str | None = Field(None, min_length=1, max_length=100)
    correo: EmailStr | None = None
    telefono: str | None = Field(None, min_length=7, max_length=20)
    rol: str | None = Field(None, pattern="^(admin|entrenador|cliente)$")
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
