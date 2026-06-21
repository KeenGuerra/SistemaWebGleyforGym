# SistemaWebGleyforGym — IngenieriawWeb

Sistema web completo para la gestión del gimnasio **GleyforGym**, desarrollado con Angular 21 (frontend SSR) y FastAPI (backend REST), con base de datos PostgreSQL.

---

## 🗂️ Estructura del Proyecto

```
SistemaWebGleyforGym/
├── render.yaml                  ← Blueprint de despliegue en Render
├── backend/                     ← API REST en FastAPI (Python)
│   ├── requirements.txt
│   ├── .env.example
│   └── src/
│       ├── main.py
│       ├── apis/
│       ├── services/
│       ├── repository/
│       ├── schemas/
│       ├── database/
│       └── core/
└── gleyforgym-frontend/         ← Aplicación Angular 21 con SSR
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   ├── services/
    │   │   └── models/
    │   └── styles.css
    └── angular.json
```

---

## 🚀 Despliegue en Render (Blueprints)

### Prerequisitos
- Cuenta en [Render](https://render.com)
- Repositorio en GitHub/GitLab conectado a Render

### Pasos

1. **Sube el proyecto a GitHub** (asegúrate de incluir `render.yaml`).
2. En el dashboard de Render, haz clic en **"New → Blueprint"**.
3. Conecta tu repositorio.
4. Render detectará el `render.yaml` y creará automáticamente:
   - 🗄️ Base de datos PostgreSQL `gleyforgym-ingenieriaweb-db`
   - ⚙️ Servicio backend `gleyforgym-ingenieriaweb-backend`
   - 🌐 Servicio frontend `gleyforgym-ingenieriaweb-frontend`
5. Confirma la creación y espera el despliegue (≈ 5-10 minutos).

### URLs resultantes (aproximadas)
| Servicio | URL |
|---|---|
| Backend API | `https://gleyforgym-ingenieriaweb-backend.onrender.com` |
| Frontend | `https://gleyforgym-ingenieriaweb-frontend.onrender.com` |
| Docs API | `https://gleyforgym-ingenieriaweb-backend.onrender.com/docs` |

> **Nota:** En el plan gratuito de Render, los servicios se "duermen" tras 15 min de inactividad. La primera petición puede tardar ~30 segundos.

---

## 💻 Desarrollo Local

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env
# Editar .env con tu DATABASE_URL local

# Iniciar servidor
uvicorn src.main:app --reload --port 8000
```

### Frontend

```bash
cd gleyforgym-frontend

npm install
npm start          # http://localhost:4200
```

### Credenciales de demostración
| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@gleyforgym.com` | `admin1234` |
| Entrenador | `carlos.ramirez@gleyforgym.com` | `carlos1234` |
| Entrenador | `sofia.castro@gleyforgym.com` | `sofia1234` |
| Cliente | `maria.gonzalez@email.com` | `maria1234` |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 21, Bootstrap 5, SSR (Express) |
| Backend | FastAPI, SQLAlchemy, Pydantic v2 |
| Base de datos | PostgreSQL |
| Autenticación | JWT (python-jose) |
| Despliegue | Render (Blueprints) |
