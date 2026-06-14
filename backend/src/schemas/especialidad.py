from pydantic import BaseModel, Field

class EspecialidadBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=50)
    descripcion: str | None = None
    activa: bool = True

class EspecialidadCreate(EspecialidadBase):
    pass

class EspecialidadUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=50)
    descripcion: str | None = None
    activa: bool | None = None

class EspecialidadResponse(EspecialidadBase):
    id: int

    class Config:
        from_attributes = True
