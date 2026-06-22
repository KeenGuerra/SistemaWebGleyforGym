from sqlalchemy.orm import Session
from datetime import date, timedelta
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.cliente_repository import cliente_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.usuario_repository import usuario_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.entrenador_repository import entrenador_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.membresia_repository import membresia_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.usuario import UsuarioCreate
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.security import get_password_hash
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Cliente
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.exceptions import raise_not_found, raise_bad_request

class ClienteService:
    def get_by_id(self, db: Session, cliente_id: int) -> Cliente:
        cliente = cliente_repository.get_by_id(db, cliente_id)
        if not cliente:
            raise_not_found("Cliente no encontrado")
        return cliente

    def get_all(self, db: Session) -> list[Cliente]:
        return cliente_repository.get_all(db)

    def create(self, db: Session, cliente_in: ClienteCreate) -> Cliente:
        # 1. Crear el usuario asociado primero
        existing_user = usuario_repository.get_by_correo(db, cliente_in.usuario.correo)
        if existing_user:
            raise_bad_request("El correo electrónico ya se encuentra registrado")
        
        # Validar DNI duplicado
        existing_dni = db.query(Cliente).join(Cliente.usuario).filter(
            Cliente.usuario.has(dni=cliente_in.usuario.dni)
        ).first()
        if existing_dni:
            raise_bad_request("El DNI ya se encuentra registrado")
        
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
        if cliente_in.dni is not None:
            user_updates["dni"] = cliente_in.dni
        if cliente_in.correo is not None:
            # Validar correo duplicado
            if cliente_in.correo != db_user.correo:
                existing = usuario_repository.get_by_correo(db, cliente_in.correo)
                if existing:
                    raise_bad_request("El correo electrónico ya está en uso")
            user_updates["correo"] = cliente_in.correo
        
        if cliente_in.activo is not None:
            user_updates["activo"] = cliente_in.activo

        if user_updates:
            # pyrefly: ignore [missing-import]
            # pyright: ignore [reportMissingImports]
            from src.schemas.usuario import UsuarioUpdate
            user_schema = UsuarioUpdate(**user_updates)
            usuario_repository.update(db, db_user, user_schema)

        # Actualizar datos de cliente
        client_updates = {}
        fields = ["objetivo_id", "peso", "altura", "fecha_nacimiento", "sexo", "direccion", "restricciones_medicas", "activo"]
        for field in fields:
            val = getattr(cliente_in, field, None)
            if val is not None:
                client_updates[field] = val

        if client_updates:
            cliente_repository.update(db, db_cliente, client_updates)

        # Actualizar entrenador asignado si viene
        if cliente_in.entrenador_id is not None:
            entrenador = entrenador_repository.get_by_id(db, cliente_in.entrenador_id)
            if not entrenador:
                raise_not_found("El entrenador especificado no existe")
            cliente_repository.asignar_entrenador(db, cliente_id, cliente_in.entrenador_id)

        # Actualizar membresía asignada si viene
        if cliente_in.membresia_id is not None:
            # Obtener todas las membresías del cliente para ver la más reciente
            todas_m = membresia_repository.get_cliente_membresias_all(db, cliente_id)
            # Ordenar por id descendente
            reciente_m = sorted(todas_m, key=lambda x: x.id, reverse=True)[0] if todas_m else None
            
            # Solo registrar si no tiene membresía o si el plan es diferente
            if not reciente_m or reciente_m.membresia_id != cliente_in.membresia_id:
                membresia = membresia_repository.get_by_id(db, cliente_in.membresia_id)
                if not membresia:
                    raise_not_found("La membresía especificada no existe")
                
                # Registrar una membresía para el cliente a partir de hoy (usando duracion_dias)
                hoy = date.today()
                fin = hoy + timedelta(days=membresia.duracion_dias)
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

        # Obtener la membresía más reciente (activa preferiblemente, o la última por ID)
        todas_m = membresia_repository.get_cliente_membresias_all(db, c.id)
        sub = next((m for m in todas_m if m.estado == "ACTIVA"), None)
        if not sub and todas_m:
            sub = sorted(todas_m, key=lambda x: x.id, reverse=True)[0]

        membresia_id = sub.membresia_id if sub else None
        membresia_tipo = sub.membresia.nombre if sub else None
        membresia_estado = sub.estado if sub else "VENCIDA"
        membresia_fin = str(sub.fecha_fin) if sub else "N/A"

        # Obtener objetivo
        objetivo_nombre = c.objetivo.nombre if c.objetivo else None

        return ClienteResponse(
            id=c.id,
            usuario=c.usuario,
            objetivo_id=c.objetivo_id,
            peso=float(c.peso) if c.peso else None,
            altura=float(c.altura) if c.altura else None,
            fecha_nacimiento=c.fecha_nacimiento,
            sexo=c.sexo,
            direccion=c.direccion,
            restricciones_medicas=c.restricciones_medicas,
            activo=c.activo,
            entrenador_id=entrenador_id,
            nombre_entrenador=nombre_entrenador,
            membresia_id=membresia_id,
            membresia_tipo=membresia_tipo,
            membresia_estado=membresia_estado,
            membresia_fin=membresia_fin,
            objetivo=objetivo_nombre,
            fecha_modificacion=c.fecha_modificacion
        )

cliente_service = ClienteService()
