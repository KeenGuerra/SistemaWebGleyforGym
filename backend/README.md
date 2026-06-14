# GleyforGym Backend (FastAPI)

Este es el backend del sistema de gestión de gimnasio **GleyforGym**, desarrollado utilizando Python, FastAPI y PostgreSQL. La gestión de paquetes y del entorno virtual se realiza a través de `uv`.

## Estructura del Proyecto

```
backend/
├── pyproject.toml      # Configuración del proyecto y dependencias (administrado por uv)
├── README.md           # Guía general del backend
├── AGENTS.md           # Reglas de desarrollo para IAs / Agentes
└── src/
    ├── main.py         # Punto de entrada de FastAPI
    ├── apis/           # Controladores y rutas de la API (Routers)
    ├── services/       # Lógica de negocio
    ├── repository/     # Comunicación con base de datos (Patrón Repository)
    ├── schemas/        # Esquemas de validación Pydantic
    ├── database/       # Configuración de base de datos y scripts de sembrado (seed)
    └── core/           # Configuración, seguridad (JWT, encriptación) y variables de entorno
```

## Requisitos Previos

- Python 3.10 o superior.
- `uv` (Administrador de paquetes rápido de Astral).
- PostgreSQL instalado y en ejecución.

## Configuración y Ejecución

1. **Configurar base de datos en PostgreSQL**:
   Crea una base de datos llamada `gleyforgym` (o la que especifiques en tu cadena de conexión).

2. **Variables de entorno**:
   Puedes configurar variables de entorno para la base de datos y la seguridad JWT. Por defecto, el archivo `src/core/config.py` tiene valores predeterminados para desarrollo local:
   - `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/gleyforgym` (Asegúrate de ajustar los parámetros de usuario y contraseña si son diferentes).

3. **Instalación y arranque del servidor**:
   Para descargar las dependencias y arrancar el servidor en modo desarrollo con auto-recarga:
   ```bash
   uv run uvicorn src.main:app --reload
   ```

4. **Documentación interactiva**:
   Una vez que el servidor esté en ejecución, puedes acceder a la documentación interactiva en:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Credenciales de Demostración (Sembradas en el primer arranque)

El sistema auto-siembra datos de prueba en el primer arranque. Las credenciales disponibles son:

* **Administrador**:
  - Correo: `admin@gleyforgym.com`
  - Contraseña: `admin1234`
* **Entrenadores**:
  - Correo: `carlos.ramirez@gleyforgym.com` (Contraseña: `carlos1234`)
  - Correo: `sofia.castro@gleyforgym.com` (Contraseña: `sofia1234`)
* **Clientes**:
  - Correo: `maria.gonzalez@email.com` (Contraseña: `maria1234`)
  - Correo: `jose.martinez@email.com` (Contraseña: `jose1234`)
  - Correo: `ana.lopez@email.com` (Contraseña: `ana1234`)
  - Correo: `laura.diaz@email.com` (Contraseña: `laura1234`)
