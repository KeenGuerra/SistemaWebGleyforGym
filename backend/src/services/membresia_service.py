from datetime import date, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.repository.membresia_repository import membresia_repository
from src.repository.cliente_repository import cliente_repository
from src.schemas.membresia import MembresiaCreate, RenovarMembresiaRequest, ClienteMembresiaResponse
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

    def get_activas(self, db: Session) -> list[ClienteMembresia]:
        return db.query(ClienteMembresia).filter(ClienteMembresia.estado == "activa").all()

    def get_vencidas(self, db: Session) -> list[ClienteMembresia]:
        return db.query(ClienteMembresia).filter(ClienteMembresia.estado == "vencida").all()

    def renovar(self, db: Session, req: RenovarMembresiaRequest) -> ClienteMembresia:
        # Verificar cliente
        cliente = cliente_repository.get_by_id(db, req.cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )

        # Buscar si el tipo de membresía existe en el catálogo, sino crearlo
        catalogo = db.query(Membresia).filter(Membresia.tipo == req.tipo).first()
        if not catalogo:
            # Crear temporalmente en el catálogo
            catalogo = membresia_repository.create(
                db, 
                MembresiaCreate(tipo=req.tipo, precio=req.precio, duracion_meses=req.meses, activa=True)
            )

        # Calcular fechas
        fecha_inicio = date.today()
        # Verificar si hay una membresía activa y aún no vence
        activa = membresia_repository.get_cliente_membresia_activa(db, req.cliente_id)
        if activa and activa.fecha_fin > date.today():
            # Si aún está activa, extender desde la fecha de fin anterior
            fecha_inicio = activa.fecha_fin + timedelta(days=1)
            
        fecha_fin = fecha_inicio + timedelta(days=30 * req.meses)
        
        return membresia_repository.registrar_cliente_membresia(
            db, 
            cliente_id=req.cliente_id, 
            membresia_id=catalogo.id, 
            fecha_inicio=fecha_inicio, 
            fecha_fin=fecha_fin
        )

    def decorador_cliente_membresia(self, cm: ClienteMembresia) -> ClienteMembresiaResponse:
        # Calcular dias restantes
        dias = 0
        if cm.estado == "activa":
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
