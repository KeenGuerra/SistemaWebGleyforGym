from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.repository.cliente_repository import cliente_repository
from src.repository.usuario_repository import usuario_repository
from src.repository.entrenador_repository import entrenador_repository
from src.repository.membresia_repository import membresia_repository
from src.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from src.schemas.usuario import UsuarioCreate
from src.core.security import get_password_hash
from src.database.models import Cliente

class ClienteService:
    def get_by_id(self, db: Session, cliente_id: int) -> Cliente:
        cliente = cliente_repository.get_by_id(db, cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
        return cliente

    def get_all(self, db: Session) -> list[Cliente]:
        return cliente_repository.get_all(db)

    def create(self, db: Session, cliente_in: ClienteCreate) -> Cliente:
        # 1. Crear el usuario asociado primero
        existing_user = usuario_repository.get_by_correo(db, cliente_in.usuario.correo)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya se encuentra registrado"
            )
        
        hashed_pw = get_password_hash(cliente_in.usuario.password)
        db_user = usuario_repository.create(db, cliente_in.usuario, hashed_pw)
        
        # 2. Crear el cliente
        return cliente_repository.create(db, db_user.id, cliente_in)

    def update(self, db: Session, cliente_id: int, cliente_in: ClienteUpdate) -> Cliente:
        db_cliente = self.get_by_id(db, cliente_id)
        db_user = db_cliente.usuario

        # Actualizar datos del usuario asociado si vienen
        user_updates = {}
        if cliente_in.nombre is not None:
            user_updates["nombre"] = cliente_in.nombre
        if cliente_in.apellido is not None:
            user_updates["apellido"] = cliente_in.apellido
        if cliente_in.telefono is not None:
            user_updates["telefono"] = cliente_in.telefono
        if cliente_in.correo is not None:
            # Validar correo duplicado
            if cliente_in.correo != db_user.correo:
                existing = usuario_repository.get_by_correo(db, cliente_in.correo)
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="El correo electrónico ya está en uso"
                    )
            user_updates["correo"] = cliente_in.correo
        
        if cliente_in.activo is not None:
            user_updates["activo"] = cliente_in.activo

        if user_updates:
            # Creamos un esquema temporal para actualizar
            from src.schemas.usuario import UsuarioUpdate
            user_schema = UsuarioUpdate(**user_updates)
            usuario_repository.update(db, db_user, user_schema)

        # Actualizar datos de cliente
        client_updates = {}
        if cliente_in.objetivo is not None:
            client_updates["objetivo"] = cliente_in.objetivo
        if cliente_in.peso is not None:
            client_updates["peso"] = cliente_in.peso
        if cliente_in.altura is not None:
            client_updates["altura"] = cliente_in.altura

        if client_updates:
            cliente_repository.update(db, db_cliente, client_updates)

        # Actualizar entrenador asignado si viene
        if cliente_in.entrenador_id is not None:
            entrenador = entrenador_repository.get_by_id(db, cliente_in.entrenador_id)
            if not entrenador:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="El entrenador especificado no existe"
                )
            cliente_repository.asignar_entrenador(db, cliente_id, cliente_in.entrenador_id)

        # Actualizar membresía asignada si viene
        if cliente_in.membresia_id is not None:
            membresia = membresia_repository.get_by_id(db, cliente_in.membresia_id)
            if not membresia:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="La membresía especificada no existe"
                )
            # Registrar una membresía para el cliente a partir de hoy
            from datetime import date, timedelta
            hoy = date.today()
            fin = hoy + timedelta(days=30 * membresia.duracion_meses)
            membresia_repository.registrar_cliente_membresia(db, cliente_id, membresia.id, hoy, fin)

        return db_cliente

    def delete(self, db: Session, cliente_id: int) -> Cliente:
        db_cliente = self.get_by_id(db, cliente_id)
        # Desactivar lógicamente al usuario
        usuario_repository.delete_logical(db, db_cliente.usuario)
        return db_cliente

    def decorador_cliente(self, db: Session, c: Cliente) -> ClienteResponse:
        # Obtener entrenador
        asignacion = cliente_repository.get_entrenador_asignado(db, c.id)
        entrenador_id = asignacion.entrenador_id if asignacion else None
        nombre_entrenador = None
        if asignacion and asignacion.entrenador:
            t = asignacion.entrenador.usuario
            nombre_entrenador = f"{t.nombre} {t.apellido}"

        # Obtener membresía activa
        sub = cliente_repository.get_membresia_activa(db, c.id)
        membresia_id = sub.membresia_id if sub else None
        membresia_tipo = sub.membresia.tipo if sub else None
        membresia_estado = sub.estado if sub else "vencida"
        membresia_fin = str(sub.fecha_fin) if sub else "N/A"

        return ClienteResponse(
            id=c.id,
            usuario=c.usuario,
            objetivo=c.objetivo,
            peso=c.peso,
            altura=c.altura,
            entrenador_id=entrenador_id,
            nombre_entrenador=nombre_entrenador,
            membresia_id=membresia_id,
            membresia_tipo=membresia_tipo,
            membresia_estado=membresia_estado,
            membresia_fin=membresia_fin
        )

cliente_service = ClienteService()
