from datetime import date
from sqlalchemy.orm import Session
from src.database.models import Membresia, ClienteMembresia
from src.schemas.membresia import MembresiaCreate

class MembresiaRepository:
    # --- CRUD Catálogo ---
    def get_by_id(self, db: Session, membresia_id: int) -> Membresia | None:
        return db.query(Membresia).filter(Membresia.id == membresia_id).first()

    def get_all(self, db: Session) -> list[Membresia]:
        return db.query(Membresia).all()

    def create(self, db: Session, membresia_in: MembresiaCreate) -> Membresia:
        db_membresia = Membresia(
            tipo=membresia_in.tipo,
            precio=membresia_in.precio,
            duracion_meses=membresia_in.duracion_meses,
            activa=membresia_in.activa
        )
        db.add(db_membresia)
        db.commit()
        db.refresh(db_membresia)
        return db_membresia

    # --- Suscripciones de Clientes ---
    def get_cliente_membresia_activa(self, db: Session, cliente_id: int) -> ClienteMembresia | None:
        return db.query(ClienteMembresia).filter(
            ClienteMembresia.cliente_id == cliente_id,
            ClienteMembresia.estado == "activa"
        ).first()

    def get_cliente_membresias_all(self, db: Session, cliente_id: int) -> list[ClienteMembresia]:
        return db.query(ClienteMembresia).filter(ClienteMembresia.cliente_id == cliente_id).all()

    def registrar_cliente_membresia(
        self, db: Session, cliente_id: int, membresia_id: int, fecha_inicio: date, fecha_fin: date
    ) -> ClienteMembresia:
        # Desactivar/Vencer membresías anteriores
        db.query(ClienteMembresia).filter(
            ClienteMembresia.cliente_id == cliente_id,
            ClienteMembresia.estado == "activa"
        ).update({"estado": "vencida"})

        db_sub = ClienteMembresia(
            cliente_id=cliente_id,
            membresia_id=membresia_id,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado="activa"
        )
        db.add(db_sub)
        db.commit()
        db.refresh(db_sub)
        return db_sub

membresia_repository = MembresiaRepository()
