from pydantic import BaseModel, Field

class ObjetivoBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=50)
    descripcion: str | None = None
    activo: bool = True

class ObjetivoCreate(ObjetivoBase):
    pass

class ObjetivoUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=50)
    descripcion: str | None = None
    activo: bool | None = None

class ObjetivoResponse(ObjetivoBase):
    id: int

    class Config:
        from_attributes = True
