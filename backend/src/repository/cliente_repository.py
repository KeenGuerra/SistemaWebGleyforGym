from sqlalchemy.orm import Session
from src.database.models import Cliente, ClienteEntrenador, ClienteMembresia, Usuario
from src.schemas.cliente import ClienteBase

class ClienteRepository:
    def get_by_id(self, db: Session, cliente_id: int) -> Cliente | None:
        return db.query(Cliente).filter(Cliente.id == cliente_id).first()

    def get_all(self, db: Session) -> list[Cliente]:
        return db.query(Cliente).all()

    def create(self, db: Session, user_id: int, cliente_in: ClienteBase) -> Cliente:
        db_cliente = Cliente(
            id=user_id,
            objetivo=cliente_in.objetivo,
            peso=cliente_in.peso,
            altura=cliente_in.altura
        )
        db.add(db_cliente)
        db.commit()
        db.refresh(db_cliente)
        return db_cliente

    def update(self, db: Session, db_cliente: Cliente, data: dict) -> Cliente:
        for field, value in data.items():
            if hasattr(db_cliente, field):
                setattr(db_cliente, field, value)
        db.commit()
        db.refresh(db_cliente)
        return db_cliente

    def get_entrenador_asignado(self, db: Session, cliente_id: int) -> ClienteEntrenador | None:
        return db.query(ClienteEntrenador).filter(
            ClienteEntrenador.cliente_id == cliente_id,
            ClienteEntrenador.activo == True
        ).first()

    def asignar_entrenador(self, db: Session, cliente_id: int, entrenador_id: int) -> ClienteEntrenador:
        # Desactivar asignación previa activa
        db.query(ClienteEntrenador).filter(
            ClienteEntrenador.cliente_id == cliente_id,
            ClienteEntrenador.activo == True
        ).update({"activo": False})

        db_asignacion = ClienteEntrenador(
            cliente_id=cliente_id,
            entrenador_id=entrenador_id,
            activo=True
        )
        db.add(db_asignacion)
        db.commit()
        db.refresh(db_asignacion)
        return db_asignacion

    def get_membresia_activa(self, db: Session, cliente_id: int) -> ClienteMembresia | None:
        return db.query(ClienteMembresia).filter(
            ClienteMembresia.cliente_id == cliente_id,
            ClienteMembresia.estado == "activa"
        ).first()

cliente_repository = ClienteRepository()
