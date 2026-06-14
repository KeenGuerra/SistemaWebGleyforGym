from fastapi import HTTPException, status

def raise_not_found(detail: str = "Recurso no encontrado") -> None:
    """Lanza una excepción HTTP 404 (No Encontrado) con un mensaje personalizado."""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=detail
    )

def raise_bad_request(detail: str = "Solicitud incorrecta") -> None:
    """Lanza una excepción HTTP 400 (Solicitud Incorrecta) con un mensaje personalizado."""
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail
    )

def raise_unauthorized(detail: str = "No autorizado") -> None:
    """Lanza una excepción HTTP 401 (No Autorizado) con un mensaje personalizado."""
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail
    )

def raise_forbidden(detail: str = "Acceso prohibido") -> None:
    """Lanza una excepción HTTP 403 (Acceso Prohibido) con un mensaje personalizado."""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail
    )
