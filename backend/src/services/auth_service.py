from datetime import timedelta
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.usuario_repository import usuario_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.security import verify_password, create_access_token
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.auth import LoginRequest, TokenResponse

class AuthService:
    def login(self, db: Session, req: LoginRequest) -> TokenResponse | None:
        user = usuario_repository.get_by_correo(db, req.correo)
        if not user or not user.activo:
            return None
        
        if not verify_password(req.password, user.password_hash):
            return None
        
        # Generar token
        access_token = create_access_token(subject=user.correo)
        
        return TokenResponse(
            access_token=access_token,
            rol=user.rol,
            nombre_completo=f"{user.nombre} {user.apellido}",
            correo=user.correo
        )

auth_service = AuthService()
