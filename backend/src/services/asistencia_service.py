from datetime import date, datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.repository.asistencia_repository import asistencia_repository
from src.repository.cliente_repository import cliente_repository
from src.schemas.asistencia import AsistenciaCreate, AsistenciaResponse
from src.database.models import Asistencia

class AsistenciaService:
    def registrar_entrada(self, db: Session, asist_in: AsistenciaCreate) -> Asistencia:
        # Validar cliente
        cliente = cliente_repository.get_by_id(db, asist_in.cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
            
        return asistencia_repository.create(db, asist_in)

    def registrar_salida(self, db: Session, asistencia_id: int, hora_salida: str) -> Asistencia:
        asist = asistencia_repository.get_by_id(db, asistencia_id)
        if not asist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro de asistencia no encontrado"
            )
        
        # Calcular duración en minutos
        duracion = None
        try:
            formato = "%H:%M"
            t1 = datetime.strptime(asist.hora_entrada, formato)
            t2 = datetime.strptime(hora_salida, formato)
            delta = t2 - t1
            duracion = max(0, int(delta.total_seconds() / 60))
        except ValueError:
            pass  # Si el formato es inválido, no se calcula la duración
            
        return asistencia_repository.registrar_salida(db, asist, hora_salida, duracion)

    def obtener_todas(self, db: Session) -> list[Asistencia]:
        return asistencia_repository.get_all(db)

    def obtener_por_cliente(self, db: Session, cliente_id: int) -> list[Asistencia]:
        cliente = cliente_repository.get_by_id(db, cliente_id)
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
        return asistencia_repository.get_by_cliente(db, cliente_id)

    def obtener_por_fecha(self, db: Session, target_fecha: date) -> list[Asistencia]:
        return asistencia_repository.get_by_fecha(db, target_fecha)

    def decorador_asistencia(self, a: Asistencia) -> AsistenciaResponse:
        u = a.cliente.usuario
        return AsistenciaResponse(
            id=a.id,
            cliente_id=a.cliente_id,
            entrenador_id=a.entrenador_id,
            fecha=a.fecha,
            hora_entrada=a.hora_entrada,
            hora_salida=a.hora_salida,
            duracion_minutos=a.duracion_minutos,
            nombre_cliente=f"{u.nombre} {u.apellido}"
        )

asistencia_service = AsistenciaService()
