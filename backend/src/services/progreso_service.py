from sqlalchemy.orm import Session
from fastapi import HTTPException, status
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.progreso_repository import progreso_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.cliente_repository import cliente_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.progreso import ProgresoCreate, ProgresoUpdate
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import ProgresoCliente

class ProgresoService:
    def registrar_progreso(self, db: Session, progreso_in: ProgresoCreate) -> ProgresoCliente:
        # Validar cliente
        cliente = cliente_repository.get_by_id(db, progreso_in.cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )

        # Validar peso y altura positivos
        if progreso_in.peso <= 0 or progreso_in.altura <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El peso y la altura deben ser mayores a cero"
            )

        # Guardar en base de datos
        db_prog = progreso_repository.create(db, progreso_in)
        
        # Actualizar el peso y altura del perfil del cliente actual
        cliente_repository.update(
            db, 
            cliente, 
            {"peso": progreso_in.peso, "altura": progreso_in.altura}
        )

        return db_prog

    def update_progreso(self, db: Session, progreso_id: int, progreso_in: ProgresoUpdate) -> ProgresoCliente:
        db_prog = progreso_repository.get_by_id(db, progreso_id)
        if not db_prog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro de progreso no encontrado"
            )
        return progreso_repository.update(db, db_prog, progreso_in.model_dump(exclude_unset=True))

    def obtener_por_cliente(self, db: Session, cliente_id: int) -> list[ProgresoCliente]:
        # Validar cliente
        cliente = cliente_repository.get_by_id(db, cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
        return progreso_repository.get_by_cliente(db, cliente_id)

    def obtener_todos(self, db: Session) -> list[ProgresoCliente]:
        return progreso_repository.get_all(db)

progreso_service = ProgresoService()

