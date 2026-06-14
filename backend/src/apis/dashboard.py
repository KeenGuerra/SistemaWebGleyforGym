from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.connection import get_db
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.security import get_current_user
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import Usuario, Cliente, Entrenador, ClienteMembresia, Pago, Asistencia
from datetime import date

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol == "ADMINISTRADOR":
        total_clientes = db.query(Cliente).count()
        total_entrenadores = db.query(Entrenador).count()
        membresias_activas = db.query(ClienteMembresia).filter(ClienteMembresia.estado == "ACTIVA").count()
        pagos = db.query(Pago).all()
        ingresos_totales = sum(float(p.monto) for p in pagos if p.estado == "PAGADO")
        asistencia_hoy = db.query(Asistencia).filter(Asistencia.fecha == date.today()).count()
        
        return {
            "rol": "ADMINISTRADOR",
            "total_clientes": total_clientes,
            "total_entrenadores": total_entrenadores,
            "membresias_activas": membresias_activas,
            "ingresos_totales": ingresos_totales,
            "asistencia_hoy": asistencia_hoy
        }
    elif current_user.rol == "ENTRENADOR":
        ent = db.query(Entrenador).filter(Entrenador.usuario_id == current_user.id).first()
        if not ent:
            return {"error": "Entrenador no encontrado"}
        # pyrefly: ignore [missing-import]
        # pyright: ignore [reportMissingImports]
        from src.database.models import ClienteEntrenador
        clientes_asignados = db.query(ClienteEntrenador).filter(ClienteEntrenador.entrenador_id == ent.id, ClienteEntrenador.activo == True).count()
        asistencia_hoy = db.query(Asistencia).filter(Asistencia.entrenador_id == ent.id, Asistencia.fecha == date.today()).count()
        
        return {
            "rol": "ENTRENADOR",
            "clientes_asignados": clientes_asignados,
            "asistencia_hoy": asistencia_hoy
        }
    else:  # CLIENTE
        cli = db.query(Cliente).filter(Cliente.usuario_id == current_user.id).first()
        if not cli:
            return {"error": "Cliente no encontrado"}
        sub = db.query(ClienteMembresia).filter(ClienteMembresia.cliente_id == cli.id, ClienteMembresia.estado == "ACTIVA").first()
        asistencias_total = db.query(Asistencia).filter(Asistencia.cliente_id == cli.id).count()
        
        dias_restantes = 0
        if sub:
            dias_restantes = max(0, (sub.fecha_fin - date.today()).days)
            
        return {
            "rol": "CLIENTE",
            "membresia_estado": sub.estado if sub else "VENCIDA",
            "dias_restantes": dias_restantes,
            "asistencias_total": asistencias_total
        }
