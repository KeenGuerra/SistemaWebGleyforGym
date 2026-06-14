from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.repository.progreso_repository import progreso_repository
from src.repository.cliente_repository import cliente_repository
from src.schemas.progreso import ProgresoCreate
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

        # Calcular IMC: peso (kg) / altura (m)^2
        altura_m = progreso_in.altura / 100.0
        imc = round(progreso_in.peso / (altura_m ** 2), 1)

        # Guardar en base de datos
        db_prog = progreso_repository.create(db, progreso_in, imc)
        
        # Opcionalmente, actualizar el peso y altura del perfil del cliente actual
        cliente_repository.update(
            db, 
            cliente, 
            {"peso": progreso_in.peso, "altura": progreso_in.altura}
        )

        return db_prog

    def obtener_por_cliente(self, db: Session, cliente_id: int) -> list[ProgresoCliente]:
        # Validar cliente
        cliente = cliente_repository.get_by_id(db, cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
        return progreso_repository.get_by_cliente(db, cliente_id)

progreso_service = ProgresoService()
