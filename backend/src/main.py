from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database.connection import engine, Base, SessionLocal
from src.database.seed import seed_db

# Crear tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

# Sembrar datos iniciales si es necesario
db = SessionLocal()
try:
    seed_db(db)
finally:
    db.close()

# Crear instancia de FastAPI
app = FastAPI(
    title="GleyforGym Web API",
    description="Backend en FastAPI para el sistema web de gestión de gimnasio GleyforGym",
    version="1.0.0"
)

# Configuración de CORS
origins = [
    "http://localhost:4200",  # Angular local dev server
    "http://localhost",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importar routers
from src.apis.auth import router as auth_router
from src.apis.usuario import router as usuario_router
from src.apis.cliente import router as cliente_router
from src.apis.entrenador import router as entrenador_router
from src.apis.membresia import router as membresia_router
from src.apis.pago import router as pago_router
from src.apis.asistencia import router as asistencia_router
from src.apis.progreso import router as progreso_router
from src.apis.rutina import router as rutina_router

# Registrar rutas
app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(usuario_router, prefix="/api/usuarios", tags=["Usuarios"])
app.include_router(cliente_router, prefix="/api/clientes", tags=["Clientes"])
app.include_router(entrenador_router, prefix="/api/entrenadores", tags=["Entrenadores"])
app.include_router(membresia_router, prefix="/api/membresias", tags=["Membresías"])
app.include_router(pago_router, prefix="/api/pagos", tags=["Pagos"])
app.include_router(asistencia_router, prefix="/api/asistencias", tags=["Asistencias"])
app.include_router(progreso_router, prefix="/api/progresos", tags=["Progreso de Clientes"])
app.include_router(rutina_router, prefix="/api/rutinas", tags=["Rutinas y Ejercicios"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Bienvenido a la API del Gimnasio GleyforGym"
    }
