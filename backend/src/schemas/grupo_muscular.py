from pydantic import BaseModel, Field

class GrupoMuscularBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=80)
    descripcion: str | None = None
    activo: bool = True

class GrupoMuscularCreate(GrupoMuscularBase):
    pass

class GrupoMuscularUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=80)
    descripcion: str | None = None
    activo: bool | None = None

class GrupoMuscularResponse(GrupoMuscularBase):
    id: int

    class Config:
        from_attributes = True
