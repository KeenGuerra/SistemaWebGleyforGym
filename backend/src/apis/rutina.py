from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.core.security import get_current_user
from src.schemas.rutina import EjercicioCreate, EjercicioResponse, RutinaCreate, RutinaUpdate, RutinaResponse
from src.database.models import Usuario
from src.services.rutina_service import rutina_service

router = APIRouter()

def check_admin_or_trainer(current_user: Usuario = Depends(get_current_user)):
    if current_user.rol not in ["admin", "entrenador"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación no permitida"
        )
    return current_user

# --- Catálogo de Ejercicios ---

@router.get("/ejercicios", response_model=list[EjercicioResponse])
def get_ejercicios(
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    return rutina_service.obtener_ejercicios(db)

@router.post("/ejercicios", response_model=EjercicioResponse, status_code=status.HTTP_201_CREATED)
def create_ejercicio(
    ej_in: EjercicioCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    return rutina_service.crear_ejercicio(db, ej_in)

# --- Rutinas ---

@router.get("/", response_model=list[RutinaResponse])
def get_rutinas(
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    rutinas = rutina_service.obtener_todas(db)
    return [rutina_service.decorador_rutina(r) for r in rutinas]

@router.get("/{rutina_id}", response_model=RutinaResponse)
def get_rutina(
    rutina_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    r = rutina_service.obtener_por_id(db, rutina_id)
    # Si es cliente, solo puede ver su propia rutina
    if user.rol == "cliente" and user.id != r.cliente_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para ver esta rutina"
        )
    return rutina_service.decorador_rutina(r)

@router.get("/cliente/{cliente_id}", response_model=list[RutinaResponse])
def get_rutinas_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user)
):
    if user.rol == "cliente" and user.id != cliente_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para acceder a esta información"
        )
    rutinas = rutina_service.obtener_por_cliente(db, cliente_id)
    return [rutina_service.decorador_rutina(r) for r in rutinas]

@router.post("/", response_model=RutinaResponse, status_code=status.HTTP_201_CREATED)
def create_rutina(
    rutina_in: RutinaCreate,
    entrenador_id: int | None = None,
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    if user.rol == "entrenador":
        active_entrenador_id = user.id
    else:  # admin
        if not entrenador_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El administrador debe especificar un entrenador_id para crear la rutina"
            )
        active_entrenador_id = entrenador_id

    r = rutina_service.crear_rutina(db, rutina_in, active_entrenador_id)
    return rutina_service.decorador_rutina(r)

@router.put("/{rutina_id}", response_model=RutinaResponse)
def update_rutina(
    rutina_id: int,
    rutina_in: RutinaUpdate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    r = rutina_service.actualizar_rutina(db, rutina_id, rutina_in)
    return rutina_service.decorador_rutina(r)

@router.delete("/{rutina_id}", response_model=RutinaResponse)
def delete_rutina(
    rutina_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(check_admin_or_trainer)
):
    r = rutina_service.desactivar_rutina(db, rutina_id)
    return rutina_service.decorador_rutina(r)
