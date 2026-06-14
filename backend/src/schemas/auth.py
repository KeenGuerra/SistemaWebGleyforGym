from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    correo: EmailStr = Field(..., description="Correo electrónico del usuario")
    password: str = Field(..., min_length=8, description="Contraseña de acceso")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str
    nombre_completo: str
    correo: str

class TokenData(BaseModel):
    correo: str | None = None
