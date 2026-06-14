from sqlalchemy.orm import Session
from src.core.security import get_password_hash
from src.database.models import Usuario, Cliente, Entrenador, Membresia, ClienteMembresia, Pago, Asistencia, ProgresoCliente, Ejercicio, Rutina, RutinaEjercicio
from datetime import date, timedelta

def seed_db(db: Session):
    # 1. Verificar si ya existen usuarios
    if db.query(Usuario).first() is not None:
        return  # Ya está sembrada o tiene datos

    print("Sembrando base de datos con datos de demostración...")

    # --- Membresías de catálogo ---
    memb_mensual = Membresia(tipo="Mensual Premium", precio=50.0, duracion_meses=1, activa=True)
    memb_trimestral = Membresia(tipo="Trimestral", precio=135.0, duracion_meses=3, activa=True)
    memb_anual = Membresia(tipo="Anual", precio=480.0, duracion_meses=12, activa=True)
    db.add_all([memb_mensual, memb_trimestral, memb_anual])
    db.flush()

    # --- Usuarios & Extensiones ---
    
    # 1. Admin
    admin_user = Usuario(
        nombre="Abraham",
        apellido="Gómez",
        correo="admin@gleyforgym.com",
        telefono="809-555-0000",
        password_hash=get_password_hash("admin1234"),
        rol="admin",
        activo=True
    )
    db.add(admin_user)

    # 2. Entrenadores
    e1_user = Usuario(
        nombre="Carlos",
        apellido="Ramírez",
        correo="carlos.ramirez@gleyforgym.com",
        telefono="809-555-1234",
        password_hash=get_password_hash("carlos1234"),
        rol="entrenador",
        activo=True
    )
    e2_user = Usuario(
        nombre="Sofía",
        apellido="Castro",
        correo="sofia.castro@gleyforgym.com",
        telefono="809-555-4567",
        password_hash=get_password_hash("sofia1234"),
        rol="entrenador",
        activo=True
    )
    db.add_all([e1_user, e2_user])
    db.flush()

    e1 = Entrenador(id=e1_user.id, especialidad="Musculación y Fuerza", experiencia=5)
    e2 = Entrenador(id=e2_user.id, especialidad="Cardio y Pilates", experiencia=3)
    db.add_all([e1, e2])

    # 3. Clientes
    clientes_data = [
        {"nombre": "María", "apellido": "González", "correo": "maria.gonzalez@email.com", "tel": "809-555-5678", "pass": "maria1234", "obj": "Perder peso", "peso": 70.5, "alt": 165.0},
        {"nombre": "José", "apellido": "Martínez", "correo": "jose.martinez@email.com", "tel": "809-555-9012", "pass": "jose1234", "obj": "Ganar masa muscular", "peso": 82.0, "alt": 178.0},
        {"nombre": "Ana", "apellido": "López", "correo": "ana.lopez@email.com", "tel": "809-555-3456", "pass": "ana1234", "obj": "Tonificación", "peso": 55.0, "alt": 160.0},
        {"nombre": "Laura", "apellido": "Díaz", "correo": "laura.diaz@email.com", "tel": "809-555-2345", "pass": "laura1234", "obj": "Salud general", "peso": 64.0, "alt": 168.0}
    ]

    db_clientes = []
    for idx, c in enumerate(clientes_data):
        u_cli = Usuario(
            nombre=c["nombre"],
            apellido=c["apellido"],
            correo=c["correo"],
            telefono=c["tel"],
            password_hash=get_password_hash(c["pass"]),
            rol="cliente",
            activo=True
        )
        db.add(u_cli)
        db.flush()

        cli = Cliente(
            id=u_cli.id,
            objetivo=c["obj"],
            peso=c["peso"],
            altura=c["alt"]
        )
        db.add(cli)
        db_clientes.append(cli)
    db.flush()

    # --- Asignaciones Cliente - Entrenador ---
    # Asignar María y José a Carlos (e1), Ana y Laura a Sofía (e2)
    from src.database.models import ClienteEntrenador
    db.add_all([
        ClienteEntrenador(cliente_id=db_clientes[0].id, entrenador_id=e1.id, activo=True),
        ClienteEntrenador(cliente_id=db_clientes[1].id, entrenador_id=e1.id, activo=True),
        ClienteEntrenador(cliente_id=db_clientes[2].id, entrenador_id=e2.id, activo=True),
        ClienteEntrenador(cliente_id=db_clientes[3].id, entrenador_id=e2.id, activo=True),
    ])

    # --- Membresías de Clientes ---
    db.add_all([
        ClienteMembresia(cliente_id=db_clientes[0].id, membresia_id=memb_mensual.id, fecha_inicio=date.today() - timedelta(days=10), fecha_fin=date.today() + timedelta(days=20), estado="activa"),
        ClienteMembresia(cliente_id=db_clientes[1].id, membresia_id=memb_trimestral.id, fecha_inicio=date.today() - timedelta(days=45), fecha_fin=date.today() + timedelta(days=45), estado="activa"),
        ClienteMembresia(cliente_id=db_clientes[2].id, membresia_id=memb_anual.id, fecha_inicio=date.today() - timedelta(days=100), fecha_fin=date.today() + timedelta(days=265), estado="activa"),
        # Laura tiene una membresía vencida
        ClienteMembresia(cliente_id=db_clientes[3].id, membresia_id=memb_mensual.id, fecha_inicio=date.today() - timedelta(days=40), fecha_fin=date.today() - timedelta(days=10), estado="vencida"),
    ])

    # --- Pagos ---
    db.add_all([
        Pago(cliente_id=db_clientes[0].id, monto=50.0, concepto="Mensual Premium", metodo="tarjeta", estado="pagado", fecha=date.today() - timedelta(days=10)),
        Pago(cliente_id=db_clientes[1].id, monto=135.0, concepto="Trimestral", metodo="transferencia", estado="pagado", fecha=date.today() - timedelta(days=45)),
        Pago(cliente_id=db_clientes[2].id, monto=480.0, concepto="Anual", metodo="efectivo", estado="pagado", fecha=date.today() - timedelta(days=100)),
        Pago(cliente_id=db_clientes[3].id, monto=50.0, concepto="Mensual Premium - Mora/Expirada", metodo="efectivo", estado="pagado", fecha=date.today() - timedelta(days=40)),
    ])

    # --- Asistencias ---
    db.add_all([
        Asistencia(cliente_id=db_clientes[0].id, entrenador_id=e1.id, fecha=date.today(), hora_entrada="08:00", hora_salida="09:30", duracion_minutos=90, observaciones="Excelente entrenamiento de pierna"),
        Asistencia(cliente_id=db_clientes[1].id, entrenador_id=e1.id, fecha=date.today(), hora_entrada="09:15", hora_salida="10:45", duracion_minutos=90, observaciones="Rutina de pecho completada"),
        Asistencia(cliente_id=db_clientes[2].id, entrenador_id=e2.id, fecha=date.today() - timedelta(days=1), hora_entrada="17:00", hora_salida="18:00", duracion_minutos=60, observaciones="Clase de pilates"),
    ])

    # --- Progreso Clientes ---
    db.add_all([
        ProgresoCliente(cliente_id=db_clientes[0].id, fecha=date.today() - timedelta(days=30), peso=72.0, altura=165.0, imc=26.4, notas="Peso inicial"),
        ProgresoCliente(cliente_id=db_clientes[0].id, fecha=date.today(), peso=70.5, altura=165.0, imc=25.9, notas="Reducción de grasa corporal"),
        ProgresoCliente(cliente_id=db_clientes[1].id, fecha=date.today(), peso=82.0, altura=178.0, imc=25.9, notas="Ganancia muscular limpia"),
    ])

    # --- Ejercicios Catalogo ---
    sentadilla = Ejercicio(nombre="Sentadilla Libre", descripcion="Sentadilla profunda con barra olímpica")
    press_banca = Ejercicio(nombre="Press de Banca", descripcion="Press horizontal con barra")
    peso_muerto = Ejercicio(nombre="Peso Muerto", descripcion="Peso muerto convencional")
    curl_biceps = Ejercicio(nombre="Curl de Bíceps", descripcion="Curl con barra Z de pie")
    db.add_all([sentadilla, press_banca, peso_muerto, curl_biceps])
    db.flush()

    # --- Rutinas ---
    rutina_maria = Rutina(
        nombre="Rutina de Piernas y Glúteos",
        cliente_id=db_clientes[0].id,
        entrenador_id=e1.id,
        dias_semana="Lunes,Miércoles",
        nivel="principiante",
        objetivo="Tonificación y pérdida de peso",
        fecha_creacion=date.today(),
        activa=True,
        descripcion="Enfoque en tren inferior con cargas moderadas"
    )
    db.add(rutina_maria)
    db.flush()

    db.add_all([
        RutinaEjercicio(rutina_id=rutina_maria.id, ejercicio_id=sentadilla.id, series=4, repeticiones="12", descanso="90 seg", notas="Mantener la espalda recta"),
        RutinaEjercicio(rutina_id=rutina_maria.id, ejercicio_id=curl_biceps.id, series=3, repeticiones="15", descanso="60 seg", notas="Concentrar el esfuerzo")
    ])

    db.commit()
    print("¡Base de datos sembrada con éxito!")
