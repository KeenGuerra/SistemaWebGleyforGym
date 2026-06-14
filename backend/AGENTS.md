# AGENTS.md - Reglas de desarrollo backend GleyforGym

## Rol del asistente
Eres un experto en desarrollo backend con Python, FastAPI, SQLAlchemy y PostgreSQL. Debes producir código de alta calidad, seguro, modular, documentado y listo para interactuar con un frontend de Angular 21.

## Arquitectura obligatoria del proyecto
El código del backend debe estructurarse estrictamente bajo el patrón arquitectónico del flujo unidireccional:
`main.py -> apis/ (Routers) -> services/ (Reglas de Negocio) -> repository/ (Acceso a Datos) -> database/`

### Capas del Proyecto:
- **`src/main.py`**: Configuración del servidor, CORS, inicialización de base de datos y registro de routers.
- **`src/apis/`**: Define los endpoints de FastAPI y la verificación de roles con `get_current_user`.
- **`src/services/`**: Contiene la lógica del negocio (ej. validaciones lógicas, cálculos de IMC, cálculos de expiración de membresías).
- **`src/repository/`**: Contiene operaciones directas con SQLAlchemy sobre los modelos. No debe tener lógica de negocio.
- **`src/schemas/`**: Modelos Pydantic para validar entradas y formatear las respuestas.
- **`src/database/`**: Conexión a la base de datos PostgreSQL, definición del ORM Base y sembrado de datos (`seed.py`).
- **`src/core/`**: Configuraciones generales de seguridad, encriptación de contraseñas y generación de tokens JWT.

## Buenas prácticas de Python & FastAPI
- **Tipado estricto**: Usar anotaciones de tipo completas en todos los argumentos y retornos de funciones.
- **Evitar tipos débiles**: Evitar el uso de `Any` en la medida de lo posible.
- **Gestión de dependencias**: Usar `uv` para instalar paquetes. No modificar manualmente el entorno virtual.
- **Manejo de excepciones**: Utilizar `HTTPException` de FastAPI para responder con códigos de error apropiados (400, 401, 403, 404) y mensajes claros en español.
- **Sesión de base de datos**: Inyectar la sesión mediante `Depends(get_db)` y cerrarla correctamente.
- **Seguridad**: Proteger las rutas utilizando `Depends(get_current_user)` y verificar los roles (`rol` en el modelo `Usuario`).

## Reglas de la Base de Datos
- Las tablas mapeadas son exactamente 12: `usuarios`, `clientes`, `entrenadores`, `cliente_entrenador`, `membresias`, `cliente_membresias`, `pagos`, `asistencias`, `progreso_clientes`, `ejercicios`, `rutinas`, `rutina_ejercicios`.
- Usar claves foráneas e integridad referencial adecuadas.
- Para el borrado de usuarios y clientes, preferir la desactivación lógica (`activo = False`) para mantener la consistencia histórica.
