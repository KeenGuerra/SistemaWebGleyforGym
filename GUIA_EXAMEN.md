# Guía de Estudio Examen Técnico: GleyforGym 🏋️‍♂️

Esta guía explica desde lo más básico los conceptos técnicos de la plataforma **GleyforGym** (Frontend, Backend y Base de Datos) de una manera comprensible para ingenieros junior o estudiantes que se preparan para una evaluación técnica.

---

## PARTE 1: FRONTEND (Angular 21+)

### 1. ¿Qué son los Componentes Standalone?
Antes (Angular 14 hacia atrás), cada componente debía declararse en un archivo central gigante llamado `NgModule` (`app.module.ts`). Esto causaba que la aplicación fuera lenta e innecesariamente compleja.
* **Componente Standalone**: Es un componente independiente. Ya **no necesita `NgModule`**. Él mismo declara lo que necesita importar (como rutas, directivas o módulos de formulario) en su decorador `@Component`.
* **Ejemplo de código en GleyforGym (`clientes.ts`)**:
  ```typescript
  @Component({
    selector: 'app-clientes',
    standalone: true, // Indica que no depende de ningún NgModule
    imports: [CommonModule, FormsModule, RouterLink], // Importa directamente sus dependencias
    templateUrl: './clientes.html',
    styleUrl: './clientes.css',
  })
  export class Clientes { ... }
  ```

---

### 2. Angular Signals: El Nuevo Motor Reactivo
Un **Signal** es un contenedor que almacena un valor y notifica automáticamente a toda la aplicación cuando ese valor cambia, sin necesidad de hacer renders innecesarios.

#### A) ¿Para qué sirve `signal()`?
Define un estado inicial reactivo. Se puede leer ejecutando su nombre como una función `nombreVariable()` y se puede modificar usando `.set(nuevoValor)` o `.update(v => v + 1)`.
* **Ejemplo de código**: 
  ```typescript
  // Signal para guardar si el modal de registro está abierto o cerrado
  readonly showModal = signal<boolean>(false); 

  // Métodos para cambiar su valor:
  openAddModal() {
    this.showModal.set(true); // Cambia el valor a true
  }
  ```

#### B) ¿Para qué sirve `computed()`?
Crea un valor **derivado** (o calculado) que se recalcula automáticamente basándose en otros Signals.
* **REGLA DE ORO**: Es de **solo lectura** y se actualiza **únicamente** cuando los signals que utiliza cambian su valor. Si los signals origen no cambian, `computed()` devuelve un valor en caché muy rápido.
* **Ejemplo de validación en GleyforGym (`clientes.ts`)**:
  ```typescript
  // Valida el email en tiempo real basado en el formulario
  public emailErrores = computed(() => {
    const valor = this.clientForm.email().value().trim();
    if (!valor) return 'El correo es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor)) return 'Ingresa un correo electrónico válido.';
    return null; // Retorna null si no hay errores
  });

  // Valida el formulario completo sumando los errores individuales
  public formularioValido = computed(() => {
    return (
      !this.nombreErrores() &&
      !this.apellidoErrores() &&
      !this.emailErrores() &&
      !this.pesoErrores()
    );
  });
  ```

#### C) ¿Para qué sirve `readonly` y `asReadonly()`?
* **`readonly`**: Es una palabra clave de TypeScript que impide que una variable sea reasignada en el código (hace que la variable sea constante).
* **`.asReadonly()`**: Convierte un signal de escritura (que permite `.set()` o `.update()`) en un signal de **solo lectura**.
* **¿Por qué se usa?**: Por **encapsulación y seguridad**. En los servicios, declaramos los datos con un signal privado con guion bajo (`_clientes`) para modificarlo solo dentro del servicio. Luego lo exponemos al exterior con `.asReadonly()` para que los componentes puedan consumirlo pero **no modificarlo directamente** (lo que rompería el orden de la arquitectura).
  ```typescript
  private _clientes = signal<Cliente[]>([]); // Privado: modificable solo aquí
  readonly clientes = this._clientes.asReadonly(); // Público: solo lectura para componentes
  ```

#### D) ¿Para qué es el `ngModel`?
Es una directiva que vincula un control de formulario HTML (como un `<input>`) con una propiedad de TypeScript.
* **`[ngModel]` (Lectura - Unidireccional)**: Lee el valor de TypeScript y lo dibuja en el input.
* **`(ngModelChange)` (Escritura - Evento)**: Escucha cuando el usuario escribe en el input y ejecuta una función para guardar ese nuevo valor.
* **Ejemplo de código en GleyforGym**:
  ```html
  <input
    type="email"
    [ngModel]="userForm.email().value()"
    (ngModelChange)="userForm.email().set($event)"
    class="gym-form-control"
  />
  ```

---

### 3. Modularización del Proyecto Frontend
El proyecto sigue una estructura limpia:
* `app.routes.ts`: Configura el enrutamiento para administradores, entrenadores y clientes.
* `components/`: Vistas de usuario, organizadas por rol (admin, cliente, entrenador) e inicio/login.
* `models/`: Interfaces TypeScript que definen el tipado estricto de los datos (ej. `Cliente`, `Rutina`, `Pago`).
* `services/`: Lógica de comunicación y obtención de datos preparados para backend.

---
---

## PARTE 2: BACKEND (FastAPI & Arquitectura por Capas)

### 1. ¿Qué es FastAPI?
Es un framework moderno para construir APIs con Python. Destaca por ser extremadamente rápido, soportar programación asíncrona (`async/await`) y generar **documentación interactiva automática** (`/docs` con Swagger) basada en tipos.

---

### 2. Capas del Backend: Separación de Responsabilidades
Para mantener el backend limpio y escalable, dividimos el código en 4 capas principales:

```
[ Petición HTTP ] ➔ [ Router / API ] ➔ [ Service (Negocio) ] ➔ [ Repository (SQL) ] ➔ [ Base de Datos ]
                          ↕
                  [ Schemas (Pydantic) ]
```

#### A) Capa de Routers / APIs
* **¿Para qué sirve?**: Define los caminos HTTP (endpoints). Recibe la solicitud HTTP, inyecta la conexión a la base de datos y llama a la capa de servicios. **No tiene lógica de negocio ni hace consultas directas SQL**.
* **Ejemplo de código**:
  ```python
  @router.post("/", response_model=ClienteResponse)
  def registrar_cliente(cliente_in: ClienteCreate, db: Session = Depends(get_db)):
      # Inyecta db y delega todo al servicio correspondiente
      return cliente_service.create(db, cliente_in)
  ```

#### B) Capa de Schemas (Pydantic)
* **¿Para qué sirve?**: Valida y da formato a los datos. Es el filtro de entrada y salida de la API.
  * **Schemas de entrada (`Create` / `Update`)**: Valida que los datos recibidos tengan el formato correcto (ej: contraseña de 8 caracteres, DNI único).
  * **Schemas de salida (`Response`)**: Formatea lo que le devolveremos al frontend (ocultando cosas como la contraseña encriptada).
* **Ejemplo de código (`schemas/cliente.py`)**:
  ```python
  class ClienteBase(BaseModel):
      peso: float
      altura: float
      direccion: str

  class ClienteCreate(ClienteBase):
      usuario: UsuarioCreate # Valida también que venga un usuario asociado
  ```

#### C) Capa de Services (Lógica de Negocio)
* **¿Para qué sirve?**: Es el **cerebro** del sistema. Aquí se implementan todas las reglas de negocio, se valida si el correo o el DNI ya están registrados (lanzando excepciones `HTTPException`), se encriptan las contraseñas, y se coordinan los repositorios.
* **Ejemplo de código (`services/cliente_service.py`)**:
  ```python
  class ClienteService:
      def create(self, db: Session, cliente_in: ClienteCreate) -> Cliente:
          # Regla de Negocio: Validar que el correo no esté registrado
          existing_user = usuario_repository.get_by_correo(db, cliente_in.usuario.correo)
          if existing_user:
              raise HTTPException(status_code=400, detail="El correo ya existe")
          
          # Encriptar contraseña antes de guardar
          hashed_pw = get_password_hash(cliente_in.usuario.password)
          db_user = usuario_repository.create(db, cliente_in.usuario, hashed_pw)
          
          # Guardar en base de datos
          return cliente_repository.create(db, db_user.id, cliente_in)
  ```

#### D) Capa de Repository (Acceso a Datos)
* **¿Para qué sirve?**: Es el único que interactúa con SQLAlchemy para hacer operaciones CRUD (Consultas, Inserciones, Actualizaciones) en las tablas físicas. La ventaja es que si en el futuro cambias de ORM (de SQLAlchemy a SQLModel u otro), solo modificas esta capa.
* **Ejemplo de código (`repository/cliente_repository.py`)**:
  ```python
  class ClienteRepository:
      def get_by_id(self, db: Session, cliente_id: int) -> Cliente | None:
          return db.query(Cliente).filter(Cliente.id == cliente_id).first()

      def create(self, db: Session, user_id: int, cliente_in: ClienteBase) -> Cliente:
          db_cliente = Cliente(usuario_id=user_id, peso=cliente_in.peso, altura=cliente_in.altura)
          db.add(db_cliente)
          db.commit()
          db.refresh(db_cliente)
          return db_cliente
  ```

---

### 3. Diferencia Clave: Pydantic vs SQLAlchemy
Esta es una pregunta muy común en exámenes. Ambos definen estructuras de datos, pero en capas distintas:

| Característica | Pydantic (Schemas) | SQLAlchemy (Models) |
| :--- | :--- | :--- |
| **¿Dónde actúa?** | Entrada y salida de la API (Validación). | Conexión e interacción con la Base de Datos. |
| **Objetivo** | Validar que los datos que envía el cliente sean del tipo correcto (ej. que el email tenga `@`, que la edad sea un entero positivo). | Mapear una tabla de PostgreSQL a un objeto de Python para hacer consultas SQL automáticas. |
| **Ejemplo** | `ClienteCreate` (valida el JSON que envía el frontend). | `class Cliente(Base)` (mapea la tabla `clientes` física). |

---

### 4. Inyección de Dependencias (`Depends`) y Sesión de la DB
Para interactuar con la base de datos, cada ruta de FastAPI necesita una sesión abierta (`Session`).
* **`Depends`**: Es una herramienta de FastAPI para inyectar recursos (como la conexión de la base de datos) dentro de las funciones que manejan las rutas.
* **Flujo**:
  1. El usuario hace una petición a la API.
  2. `Depends(get_db)` abre una sesión de base de datos.
  3. La ruta ejecuta las consultas.
  4. FastAPI cierra la sesión automáticamente una vez enviada la respuesta, liberando memoria y conexiones.


---
---

## PARTE 3: BASE DE DATOS (PostgreSQL)

### 1. Normalización de Base de Datos
GleyforGym está normalizado en **Tercera Forma Normal (3FN)** para evitar redundancia de información y anomalías de inserción/actualización:
* **Separación de Usuarios y Roles**: La tabla `usuarios` almacena la información básica de inicio de sesión (nombre, email, password, rol). Las tablas `clientes` y `entrenadores` extienden esta información con campos específicos (peso/altura para clientes, y años de experiencia para entrenadores).
* **Tablas Intermedias**: `entrenador_especialidades` y `cliente_entrenador` manejan relaciones de muchos a muchos de forma limpia.

---

### 2. Procedimientos Almacenados (`PROCEDURES`) y Funciones (`FUNCTIONS`)
Un procedimiento almacenado o función es un **bloque de código SQL (PL/pgSQL en PostgreSQL) que vive y se ejecuta directamente dentro del motor de la base de datos**.

#### ¿Cuál es la diferencia entre Función y Procedimiento en PostgreSQL?
* **Función (`FUNCTION`)**: Está diseñada principalmente para **calcular y retornar un valor**. Puede ser invocada dentro de una consulta `SELECT`.
* **Procedimiento (`PROCEDURE`)**: Está diseñado para **agrupar transacciones de negocio** (hacer múltiples INSERTs, UPDATEs y commits). Se invoca usando la palabra clave `CALL`. No retorna valores de la misma manera que una función, pero puede usar parámetros de salida (`INOUT` / `OUT`).

---

### 3. ¿Dónde y Por qué se usan Procedimientos Almacenados en GleyforGym?
En GleyforGym, la lógica crítica del gimnasio está encapsulada en procedimientos almacenados por temas de **consistencia, seguridad y rendimiento**. Estos son los más importantes definidos en [schema.sql](file:///d:/SistemaWebGleyforGym/backend/src/database/schema.sql):

#### A) `registrar_pago` y `registrar_pago_proc`
* **¿Qué hace?**: Registra un nuevo cobro en la tabla `pagos`. Si el pago se realiza con estado **'PAGADO'**, automáticamente ejecuta un `UPDATE` en la tabla `cliente_membresias` cambiando el estado de la suscripción a **'ACTIVA'**.
* **¿Por qué está aquí?**: Garantiza la **atomicidad**. Evita el error de registrar un pago en la base de datos pero olvidar activar la membresía del cliente, o viceversa. Ambas acciones ocurren juntas o ninguna ocurre.

#### B) `renovar_membresia` y `renovar_membresia_proc`
* **¿Qué hace?**:
  1. Busca la duración en días de la membresía seleccionada.
  2. Calcula automáticamente la `fecha_fin` (`fecha_inicio + duracion_dias`).
  3. Cambia el estado de cualquier membresía activa previa del cliente a **'VENCIDA'** (desactivación).
  4. Inserta el nuevo registro de membresía con estado **'ACTIVA'**.
* **¿Por qué está aquí?**: Protege la regla de negocio del gimnasio: **un cliente no puede tener dos membresías activas simultáneamente**, y las fechas de vigencia deben calcularse de forma exacta en el servidor de base de datos para evitar alteraciones en el cliente/frontend.

#### C) `actualizar_estado_membresias`
* **¿Qué hace?**: Busca todas las membresías que tienen estado **'ACTIVA'** pero cuya `fecha_fin` es menor al día de hoy (`fecha_fin < CURRENT_DATE`) y las cambia a **'VENCIDA'**.
* **¿Por qué está aquí?**: Es una tarea de mantenimiento del gimnasio. Se ejecuta en la base de datos mediante una tarea programada (cron job) diaria para suspender automáticamente el acceso a los clientes que no han pagado su mensualidad.

#### D) `registrar_progreso_cliente`
* **¿Qué hace?**: Registra el peso y altura del cliente, calcula matemáticamente el **IMC** (`peso / (altura * altura)`) y guarda el registro de progreso físico.
* **¿Por qué está aquí?**: Evita tener que calcular el IMC en el frontend (donde el usuario podría manipular los datos) o en el backend. La base de datos es la única fuente de verdad para cálculos médicos/físicos.

---

### 4. Triggers (Disparadores) en GleyforGym
Un **Trigger** es un evento automático que se ejecuta en la base de datos cuando ocurre una acción específica (`INSERT`, `UPDATE` o `DELETE`) sobre una tabla.

En GleyforGym usamos los siguientes triggers para automatizar tareas repetitivas:
1. `trg_calcular_imc`: Antes de insertar o actualizar en `progreso_clientes`, calcula el IMC automáticamente usando la función `calcular_imc`.
2. `trg_actualizar_estado_membresia`: Si se inserta o actualiza una membresía y su fecha de vencimiento ya pasó, cambia su estado a `'VENCIDA'` de forma inmediata.
3. `trg_fecha_modificacion`: Actualiza el campo `fecha_modificacion` al tiempo actual (`CURRENT_TIMESTAMP`) cada vez que se actualiza cualquier dato en las tablas `usuarios` o `clientes`.
