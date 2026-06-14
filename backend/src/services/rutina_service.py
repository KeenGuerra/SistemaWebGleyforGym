from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.repository.rutina_repository import rutina_repository
from src.repository.cliente_repository import cliente_repository
from src.repository.entrenador_repository import entrenador_repository
from src.schemas.rutina import RutinaCreate, RutinaUpdate, EjercicioCreate, RutinaEjercicioCreate, RutinaResponse
from src.database.models import Rutina, Ejercicio

class RutinaService:
    # --- Ejercicios ---
    def crear_ejercicio(self, db: Session, ej_in: EjercicioCreate) -> Ejercicio:
        existing = rutina_repository.get_ejercicio_by_nombre(db, ej_in.nombre)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El ejercicio '{ej_in.nombre}' ya está registrado"
            )
        return rutina_repository.create_ejercicio(db, ej_in)

    def obtener_ejercicios(self, db: Session) -> list[Ejercicio]:
        return rutina_repository.get_all_ejercicios(db)

    # --- Rutinas ---
    def crear_rutina(self, db: Session, rutina_in: RutinaCreate, entrenador_id: int) -> Rutina:
        # Validar cliente
        cliente = cliente_repository.get_by_id(db, rutina_in.cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )

        # Validar entrenador
        entrenador = entrenador_repository.get_by_id(db, entrenador_id)
        if not entrenador:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrenador no encontrado"
            )

        # 1. Crear la rutina
        db_rutina = rutina_repository.create(db, rutina_in, entrenador_id)

        # 2. Agregar ejercicios si vienen
        for ej_in in rutina_in.ejercicios:
            # Buscar si el ejercicio existe en el catálogo, sino crearlo
            ejercicio = rutina_repository.get_ejercicio_by_nombre(db, ej_in.ejercicio_nombre)
            if not ejercicio:
                ejercicio = rutina_repository.create_ejercicio(
                    db, 
                    EjercicioCreate(nombre=ej_in.ejercicio_nombre)
                )
            
            # Asociar a la rutina
            rutina_repository.agregar_ejercicio_a_rutina(db, db_rutina.id, ejercicio.id, ej_in)

        return db_rutina

    def obtener_por_id(self, db: Session, rutina_id: int) -> Rutina:
        rutina = rutina_repository.get_by_id(db, rutina_id)
        if not rutina:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rutina no encontrada"
            )
        return rutina

    def obtener_todas(self, db: Session) -> list[Rutina]:
        return rutina_repository.get_all(db)

    def obtener_por_cliente(self, db: Session, cliente_id: int) -> list[Rutina]:
        return rutina_repository.get_by_cliente(db, cliente_id)

    def obtener_por_entrenador(self, db: Session, entrenador_id: int) -> list[Rutina]:
        return rutina_repository.get_by_entrenador(db, entrenador_id)

    def actualizar_rutina(self, db: Session, rutina_id: int, rutina_in: RutinaUpdate) -> Rutina:
        db_rutina = self.obtener_por_id(db, rutina_id)
        updates = rutina_in.model_dump(exclude_unset=True)
        return rutina_repository.update(db, db_rutina, updates)

    def desactivar_rutina(self, db: Session, rutina_id: int) -> Rutina:
        db_rutina = self.obtener_por_id(db, rutina_id)
        return rutina_repository.desactivar(db, db_rutina)

    def decorador_rutina(self, r: Rutina) -> RutinaResponse:
        u = r.cliente.usuario
        
        # Parsear días
        dias_list = [d.strip() for d in r.dias_semana.split(",") if d.strip()]
        
        # Mapear ejercicios
        ejercicios_resp = []
        for re in r.ejercicios:
            from src.schemas.rutina import RutinaEjercicioResponse, EjercicioResponse
            ejercicios_resp.append(
                RutinaEjercicioResponse(
                    id=re.id,
                    series=re.series,
                    repeticiones=re.repeticiones,
                    descanso=re.descanso,
                    notas=re.notas,
                    ejercicio=EjercicioResponse(
                        id=re.ejercicio.id,
                        nombre=re.ejercicio.nombre,
                        descripcion=re.ejercicio.descripcion
                    )
                )
            )

        return RutinaResponse(
            id=r.id,
            nombre=r.nombre,
            cliente_id=r.cliente_id,
            entrenador_id=r.entrenador_id,
            dias_semana=dias_list,
            nivel=r.nivel,
            objetivo=r.objetivo,
            fecha_creacion=r.fecha_creacion,
            activa=r.activa,
            descripcion=r.descripcion,
            ejercicios=ejercicios_resp,
            nombre_cliente=f"{u.nombre} {u.apellido}"
        )

rutina_service = RutinaService()
