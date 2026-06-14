from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.core.security import get_current_user
from src.schemas.entrenador import EntrenadorCreate, EntrenadorUpdate, EntrenadorResponse, AsignarClienteRequest
from src.schemas.cliente import ClienteResponse
from src.database.models import Usuario
from src.services.entrenador_service import entrenador_service
from src.services.cliente_service import cliente_service

router = APIRouter()

def check_admin(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación permitida únicamente para administradores"
        )
    return current_user

def check_admin_or_trainer(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol not in ["admin", "entrenador"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación no permitida para el rol de cliente"
        )
    return current_user

@router.get("/", response_model=list[EntrenadorResponse])
def get_entrenadores(
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    # Cualquiera autenticado puede ver la lista de entrenadores (por ejemplo, clientes para ver a quién se les asigna)
    return entrenador_service.get_all(db)

@router.get("/{entrenador_id}", response_model=EntrenadorResponse)
def get_entrenador(
    entrenador_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    return entrenador_service.get_by_id(db, entrenador_id)

@router.post("/", response_model=EntrenadorResponse, status_code=status.HTTP_201_CREATED)
def create_entrenador(
    entrenador_in: EntrenadorCreate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(check_admin)
):
    return entrenador_service.create(db, entrenador_in)

@router.put("/{entrenador_id}", response_model=EntrenadorResponse)
def update_entrenador(
    entrenador_id: int,
    entrenador_in: EntrenadorUpdate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    # Un entrenador puede actualizar su propia información, un admin la de cualquiera
    if user.rol == "entrenador" and user.id != entrenador_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para modificar este perfil"
        )
    if user.rol == "cliente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación no permitida"
        )
    return entrenador_service.update(db, entrenador_id, entrenador_in)

@router.post("/asignar", status_code=status.HTTP_200_OK)
def asignar_cliente(
    req: AsignarClienteRequest,
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    success = entrenador_service.asignar_cliente(db, req.cliente_id, req.entrenador_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo asignar el cliente al entrenador"
        )
    return {"message": "Cliente asignado exitosamente al entrenador"}

@router.get("/{entrenador_id}/clientes", response_model=list[ClienteResponse])
def get_clientes_asignados(
    entrenador_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    # Un entrenador solo puede ver sus propios clientes, a menos que sea admin
    if user.rol == "entrenador" and user.id != entrenador_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede ver los clientes asignados a otro entrenador"
        )
    if user.rol == "cliente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación no permitida"
        )
    clientes = entrenador_service.get_clientes_asignados(db, entrenador_id)
    return [cliente_service.decorador_cliente(db, c) for c in clientes]
