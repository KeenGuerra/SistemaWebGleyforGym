from datetime import date, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.membresia_repository import membresia_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.cliente_repository import cliente_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.membresia import MembresiaCreate, RenovarMembresiaRequest, ClienteMembresiaResponse, MembresiaUpdate
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Membresia, ClienteMembresia

class MembresiaService:
    def get_catalog_by_id(self, db: Session, membresia_id: int) -> Membresia:
        memb = membresia_repository.get_by_id(db, membresia_id)
        if not memb:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Membresía no encontrada"
            )
        return memb

    def get_catalog_all(self, db: Session) -> list[Membresia]:
        return membresia_repository.get_all(db)

    def create_catalog_item(self, db: Session, membresia_in: MembresiaCreate) -> Membresia:
        return membresia_repository.create(db, membresia_in)

    def update_catalog_item(self, db: Session, membresia_id: int, membresia_in: MembresiaUpdate) -> Membresia:
        memb = self.get_catalog_by_id(db, membresia_id)
        return membresia_repository.update(db, memb, membresia_in.model_dump(exclude_unset=True))

    def get_activas(self, db: Session) -> list[ClienteMembresia]:
        # Ejecutar previamente el procedimiento almacenado para marcar vencidas
        try:
            membresia_repository.actualizar_estado_membresias_sp(db)
        except Exception:
            pass
        return db.query(ClienteMembresia).filter(ClienteMembresia.estado == "ACTIVA").all()

    def get_vencidas(self, db: Session) -> list[ClienteMembresia]:
        try:
            membresia_repository.actualizar_estado_membresias_sp(db)
        except Exception:
            pass
        return db.query(ClienteMembresia).filter(ClienteMembresia.estado == "VENCIDA").all()

    def get_todas_suscripciones(self, db: Session) -> list[ClienteMembresia]:
        try:
            membresia_repository.actualizar_estado_membresias_sp(db)
        except Exception:
            pass
        return membresia_repository.get_all_suscripciones(db)

    def renovar(self, db: Session, req: RenovarMembresiaRequest) -> ClienteMembresia:
        # Verificar cliente
        cliente = cliente_repository.get_by_id(db, req.cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )

        # Verificar membresía
        memb = membresia_repository.get_by_id(db, req.membresia_id)
        if not memb:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Membresía no encontrada en el catálogo"
            )

        # Calcular fecha de inicio si no es provista
        fecha_inicio = req.fecha_inicio
        if not fecha_inicio:
            fecha_inicio = date.today()
            activa = membresia_repository.get_cliente_membresia_activa(db, req.cliente_id)
            if activa and activa.fecha_fin > date.today():
                fecha_inicio = activa.fecha_fin + timedelta(days=1)

        # Usar procedimiento almacenado
        try:
            return membresia_repository.renovar_membresia_sp(
                db, 
                cliente_id=req.cliente_id, 
                membresia_id=req.membresia_id, 
                fecha_inicio=fecha_inicio
            )
        except Exception:
            # Fallback
            fecha_fin = fecha_inicio + timedelta(days=memb.duracion_dias)
            return membresia_repository.registrar_cliente_membresia(
                db, 
                cliente_id=req.cliente_id, 
                membresia_id=req.membresia_id, 
                fecha_inicio=fecha_inicio, 
                fecha_fin=fecha_fin
            )

    def decorador_cliente_membresia(self, db: Session, cm: ClienteMembresia) -> ClienteMembresiaResponse:
        # Calcular dias restantes
        dias = 0
        if cm.estado == "ACTIVA":
            diff = cm.fecha_fin - date.today()
            dias = max(0, diff.days)
            
        return ClienteMembresiaResponse(
            id=cm.id,
            cliente_id=cm.cliente_id,
            membresia_id=cm.membresia_id,
            fecha_inicio=cm.fecha_inicio,
            fecha_fin=cm.fecha_fin,
            estado=cm.estado,
            dias_restantes=dias,
            membresia=cm.membresia
        )

membresia_service = MembresiaService()
