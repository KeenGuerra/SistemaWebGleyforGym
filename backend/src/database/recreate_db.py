import sys
import os
from sqlalchemy import text

# Añadir backend al path para poder importar src.* correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.connection import engine, Base, SessionLocal
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.seed import seed_db

def main():
    print("Iniciando recreación de la base de datos de GleyforGym...")
    
    # 1. Eliminar todas las tablas existentes en orden o en cascada
    with engine.begin() as conn:
        print("Eliminando tablas existentes...")
        conn.execute(text("""
            DROP TABLE IF EXISTS cliente_entrenador, rutina_ejercicios, rutinas, 
            ejercicios, grupo_muscular, progreso_clientes, asistencias, pagos, 
            cliente_membresias, membresias, entrenador_especialidades, 
            especialidades, entrenadores, clientes, objetivos, usuarios CASCADE;
        """))
        print("Tablas eliminadas con éxito.")

    # 2. Crear las tablas nuevamente basándose en los modelos SQLAlchemy
    print("Creando nuevas tablas a partir de los modelos de SQLAlchemy...")
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas con éxito.")

    # 3. Sembrar datos iniciales y recrear funciones/procedimientos
    print("Sembrando datos de demostración y funciones de PostgreSQL...")
    db = SessionLocal()
    try:
        seed_db(db)
        print("Base de datos recreada y sembrada con éxito.")
    except Exception as e:
        print(f"Error al sembrar la base de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
