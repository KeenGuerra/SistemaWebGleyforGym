from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import text
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Membresia, ClienteMembresia
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.membresia import MembresiaCreate, MembresiaUpdate

class MembresiaRepository:
    # --- CRUD Catálogo ---
    def get_by_id(self, db: Session, membresia_id: int) -> Membresia | None:
        return db.query(Membresia).filter(Membresia.id == membresia_id).first()

    def get_all(self, db: Session) -> list[Membresia]:
        return db.query(Membresia).all()

    def create(self, db: Session, membresia_in: MembresiaCreate) -> Membresia:
        db_membresia = Membresia(
            nombre=membresia_in.nombre,
            descripcion=membresia_in.descripcion,
            precio=membresia_in.precio,
            duracion_dias=membresia_in.duracion_dias,
            activa=membresia_in.activa
        )
        db.add(db_membresia)
        db.commit()
        db.refresh(db_membresia)
        return db_membresia

    def update(self, db: Session, db_membresia: Membresia, data: dict) -> Membresia:
        for field, value in data.items():
            if hasattr(db_membresia, field):
                setattr(db_membresia, field, value)
        db.commit()
        db.refresh(db_membresia)
        return db_membresia

    # --- Suscripciones de Clientes ---
    def get_cliente_membresia_activa(self, db: Session, cliente_id: int) -> ClienteMembresia | None:
        return db.query(ClienteMembresia).filter(
            ClienteMembresia.cliente_id == cliente_id,
            ClienteMembresia.estado == "ACTIVA"
        ).first()

    def get_cliente_membresias_all(self, db: Session, cliente_id: int) -> list[ClienteMembresia]:
        return db.query(ClienteMembresia).filter(ClienteMembresia.cliente_id == cliente_id).all()

    def get_all_suscripciones(self, db: Session) -> list[ClienteMembresia]:
        return db.query(ClienteMembresia).all()

    def registrar_cliente_membresia(
        self, db: Session, cliente_id: int, membresia_id: int, fecha_inicio: date, fecha_fin: date
    ) -> ClienteMembresia:
        # Desactivar/Vencer membresías anteriores
        db.query(ClienteMembresia).filter(
            ClienteMembresia.cliente_id == cliente_id,
            ClienteMembresia.estado == "ACTIVA"
        ).update({"estado": "VENCIDA"})

        db_sub = ClienteMembresia(
            cliente_id=cliente_id,
            membresia_id=membresia_id,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado="ACTIVA"
        )
        db.add(db_sub)
        db.commit()
        db.refresh(db_sub)
        return db_sub

    def renovar_membresia_sp(self, db: Session, cliente_id: int, membresia_id: int, fecha_inicio: date) -> ClienteMembresia:
        # Invocar la función almacenada de PostgreSQL
        query = text("SELECT renovar_membresia(:c_id, :m_id, :f_ini)")
        result = db.execute(query, {"c_id": cliente_id, "m_id": membresia_id, "f_ini": fecha_inicio})
        new_id = result.scalar()
        db.commit()
        return db.query(ClienteMembresia).filter(ClienteMembresia.id == new_id).first()

    def actualizar_estado_membresias_sp(self, db: Session) -> int:
        query = text("SELECT actualizar_estado_membresias()")
        result = db.execute(query)
        db.commit()
        return result.scalar() or 0

membresia_repository = MembresiaRepository()
