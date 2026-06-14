from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.rutina_repository import rutina_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.cliente_repository import cliente_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.repository.entrenador_repository import entrenador_repository
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.rutina import (
    RutinaCreate, RutinaUpdate, EjercicioCreate, RutinaEjercicioCreate, 
    RutinaResponse, RutinaEjercicioResponse, EjercicioResponse
)
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.grupo_muscular import GrupoMuscularResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.schemas.objetivo import ObjetivoResponse
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Rutina, Ejercicio
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.exceptions import raise_not_found, raise_bad_request

class RutinaService:
    # --- Ejercicios ---
    def crear_ejercicio(self, db: Session, ej_in: EjercicioCreate) -> Ejercicio:
        existing = rutina_repository.get_ejercicio_by_nombre(db, ej_in.nombre)
        if existing:
            raise_bad_request(f"El ejercicio '{ej_in.nombre}' ya está registrado")
        return rutina_repository.create_ejercicio(db, ej_in)

    def obtener_ejercicios(self, db: Session) -> list[Ejercicio]:
        return rutina_repository.get_all_ejercicios(db)

    # --- Rutinas ---
    def crear_rutina(self, db: Session, rutina_in: RutinaCreate, entrenador_id: int) -> Rutina:
        # Validar cliente
        cliente = cliente_repository.get_by_id(db, rutina_in.cliente_id)
        if not cliente:
            raise_not_found("Cliente no encontrado")

        # Validar entrenador
        entrenador = entrenador_repository.get_by_id(db, entrenador_id)
        if not entrenador:
            raise_not_found("Entrenador no encontrado")

        # 1. Crear la rutina
        db_rutina = rutina_repository.create(db, rutina_in, entrenador_id)

        # 2. Agregar ejercicios
        for ej_in in rutina_in.ejercicios:
            ejercicio = rutina_repository.get_ejercicio_by_id(db, ej_in.ejercicio_id)
            if not ejercicio:
                raise_not_found(f"Ejercicio con ID {ej_in.ejercicio_id} no encontrado en el catálogo")
            
            rutina_repository.agregar_ejercicio_a_rutina(db, db_rutina.id, ejercicio.id, ej_in)

        return db_rutina

    def obtener_por_id(self, db: Session, rutina_id: int) -> Rutina:
        rutina = rutina_repository.get_by_id(db, rutina_id)
        if not rutina:
            raise_not_found("Rutina no encontrada")
        return rutina

    def obtener_todas(self, db: Session) -> list[Rutina]:
        return rutina_repository.get_all(db)

    def obtener_por_cliente(self, db: Session, cliente_id: int) -> list[Rutina]:
        return rutina_repository.get_by_cliente(db, cliente_id)

    def obtener_por_entrenador(self, db: Session, entrenador_id: int) -> list[Rutina]:
        return rutina_repository.get_by_entrenador(db, entrenador_id)

    def actualizar_rutina(self, db: Session, rutina_id: int, rutina_in: RutinaUpdate) -> Rutina:
        db_rutina = self.obtener_por_id(db, rutina_id)
        
        # Si vienen ejercicios en el update, los limpiamos y re-agregamos
        if rutina_in.ejercicios is not None:
            rutina_repository.limpiar_ejercicios_de_rutina(db, rutina_id)
            for ej_in in rutina_in.ejercicios:
                ejercicio = rutina_repository.get_ejercicio_by_id(db, ej_in.ejercicio_id)
                if ejercicio:
                    rutina_repository.agregar_ejercicio_a_rutina(db, rutina_id, ejercicio.id, ej_in)
                    
        updates = rutina_in.model_dump(exclude_unset=True)
        if "ejercicios" in updates:
            del updates["ejercicios"]
            
        return rutina_repository.update(db, db_rutina, updates)

    def desactivar_rutina(self, db: Session, rutina_id: int) -> Rutina:
        db_rutina = self.obtener_por_id(db, rutina_id)
        return rutina_repository.desactivar(db, db_rutina)

    def decorador_rutina(self, r: Rutina) -> RutinaResponse:
        u = r.cliente.usuario
        
        # Mapear ejercicios
        ejercicios_resp = []
        for re in r.ejercicios:
            gm_resp = None
            if re.ejercicio.grupo_muscular:
                gm_resp = GrupoMuscularResponse(
                    id=re.ejercicio.grupo_muscular.id,
                    nombre=re.ejercicio.grupo_muscular.nombre,
                    descripcion=re.ejercicio.grupo_muscular.descripcion,
                    activo=re.ejercicio.grupo_muscular.activo
                )
                
            ejercicios_resp.append(
                RutinaEjercicioResponse(
                    id=re.id,
                    ejercicio_id=re.ejercicio_id,
                    series=re.series,
                    repeticiones=re.repeticiones,
                    descanso_segundos=re.descanso_segundos,
                    dia_semana=re.dia_semana,
                    orden=re.orden,
                    notas=re.notas,
                    ejercicio=EjercicioResponse(
                        id=re.ejercicio.id,
                        nombre=re.ejercicio.nombre,
                        descripcion=re.ejercicio.descripcion,
                        grupo_muscular_id=re.ejercicio.grupo_muscular_id,
                        nivel=re.ejercicio.nivel,
                        video_url=re.ejercicio.video_url,
                        activo=re.ejercicio.activo,
                        grupo_muscular=gm_resp
                    )
                )
            )

        obj_resp = None
        if r.objetivo:
            obj_resp = ObjetivoResponse(
                id=r.objetivo.id,
                nombre=r.objetivo.nombre,
                descripcion=r.objetivo.descripcion,
                activo=r.objetivo.activo
            )

        return RutinaResponse(
            id=r.id,
            nombre=r.nombre,
            cliente_id=r.cliente_id,
            entrenador_id=r.entrenador_id,
            nivel=r.nivel,
            objetivo_id=r.objetivo_id,
            fecha_creacion=r.fecha_creacion,
            activa=r.activa,
            descripcion=r.descripcion,
            ejercicios=ejercicios_resp,
            nombre_cliente=f"{u.nombre} {u.apellido}",
            objetivo=obj_resp
        )

rutina_service = RutinaService()
