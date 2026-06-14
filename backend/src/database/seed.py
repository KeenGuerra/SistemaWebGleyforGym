from sqlalchemy.orm import Session
from sqlalchemy import text
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.core.security import get_password_hash
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.models import (
    Usuario, Cliente, Entrenador, Membresia, ClienteMembresia, Pago, 
    Asistencia, ProgresoCliente, Ejercicio, Rutina, RutinaEjercicio,
    Objetivo, Especialidad, EntrenadorEspecialidad, GrupoMuscular, ClienteEntrenador
)
from datetime import date, timedelta, time
import decimal

def seed_db(db: Session):
    # --- 0. Crear Procedimientos Almacenados en PostgreSQL ---
    # Para evitar errores en otros dialectos o si no se usa PostgreSQL, capturamos excepciones
    print("Creando procedimientos almacenados en PostgreSQL...")
    procedures_sql = [
        """
        CREATE OR REPLACE FUNCTION registrar_pago(
            p_cliente_membresia_id INTEGER,
            p_monto NUMERIC(10,2),
            p_metodo_pago VARCHAR(50),
            p_estado VARCHAR(20),
            p_comprobante TEXT,
            p_observacion TEXT,
            p_fecha_pago DATE DEFAULT CURRENT_DATE
        ) RETURNS INTEGER AS $$
        DECLARE
            v_pago_id INTEGER;
        BEGIN
            INSERT INTO pagos (cliente_membresia_id, monto, fecha_pago, metodo_pago, estado, comprobante, observacion)
            VALUES (p_cliente_membresia_id, p_monto, p_fecha_pago, p_metodo_pago, p_estado, p_comprobante, p_observacion)
            RETURNING id INTO v_pago_id;
            
            IF p_estado = 'PAGADO' THEN
                UPDATE cliente_membresias
                SET estado = 'ACTIVA'
                WHERE id = p_cliente_membresia_id;
            END IF;
            
            RETURN v_pago_id;
        END;
        $$ LANGUAGE plpgsql;
        """,
        """
        CREATE OR REPLACE FUNCTION registrar_asistencia(
            p_cliente_id INTEGER,
            p_entrenador_id INTEGER,
            p_hora_entrada TIME,
            p_hora_salida TIME,
            p_estado VARCHAR(20),
            p_observaciones TEXT,
            p_fecha DATE DEFAULT CURRENT_DATE
        ) RETURNS INTEGER AS $$
        DECLARE
            v_asistencia_id INTEGER;
        BEGIN
            INSERT INTO asistencias (cliente_id, entrenador_id, fecha, hora_entrada, hora_salida, estado, observaciones)
            VALUES (p_cliente_id, p_entrenador_id, p_fecha, p_hora_entrada, p_hora_salida, p_estado, p_observaciones)
            RETURNING id INTO v_asistencia_id;
            
            RETURN v_asistencia_id;
        END;
        $$ LANGUAGE plpgsql;
        """,
        """
        CREATE OR REPLACE FUNCTION renovar_membresia(
            p_cliente_id INTEGER,
            p_membresia_id INTEGER,
            p_fecha_inicio DATE
        ) RETURNS INTEGER AS $$
        DECLARE
            v_duracion_dias INTEGER;
            v_fecha_fin DATE;
            v_cliente_membresia_id INTEGER;
        BEGIN
            SELECT duracion_dias INTO v_duracion_dias FROM membresias WHERE id = p_membresia_id;
            
            IF v_duracion_dias IS NULL THEN
                RAISE EXCEPTION 'Membresía no encontrada';
            END IF;
            
            v_fecha_fin := p_fecha_inicio + v_duracion_dias;
            
            UPDATE cliente_membresias
            SET estado = 'VENCIDA'
            WHERE cliente_id = p_cliente_id AND estado = 'ACTIVA';
            
            INSERT INTO cliente_membresias (cliente_id, membresia_id, fecha_inicio, fecha_fin, estado)
            VALUES (p_cliente_id, p_membresia_id, p_fecha_inicio, v_fecha_fin, 'ACTIVA')
            RETURNING id INTO v_cliente_membresia_id;
            
            RETURN v_cliente_membresia_id;
        END;
        $$ LANGUAGE plpgsql;
        """,
        """
        CREATE OR REPLACE FUNCTION calcular_imc(
            p_peso NUMERIC(6,2),
            p_altura NUMERIC(4,2)
        ) RETURNS NUMERIC(5,2) AS $$
        BEGIN
            IF p_altura IS NULL OR p_altura = 0 THEN
                RETURN 0.00;
            END IF;
            RETURN ROUND(p_peso / (p_altura * p_altura), 2);
        END;
        $$ LANGUAGE plpgsql;
        """,
        """
        CREATE OR REPLACE FUNCTION actualizar_estado_membresias() 
        RETURNS INTEGER AS $$
        DECLARE
            v_updated_count INTEGER;
        BEGIN
            UPDATE cliente_membresias
            SET estado = 'VENCIDA'
            WHERE estado = 'ACTIVA' AND fecha_fin < CURRENT_DATE;
            
            GET DIAGNOSTICS v_updated_count = ROW_COUNT;
            RETURN v_updated_count;
        END;
        $$ LANGUAGE plpgsql;
        """
    ]

    for proc in procedures_sql:
        try:
            db.execute(text(proc))
            db.commit()
        except Exception as e:
            print(f"Advertencia al crear procedimiento almacenado: {e}")
            db.rollback()

    # --- 1. Verificar si ya existen usuarios ---
    if db.query(Usuario).first() is not None:
        return

    print("Sembrando base de datos con datos de demostración...")

    # --- Especialidades ---
    esp_musc = Especialidad(nombre="Musculación y Fuerza", descripcion="Entrenamiento con pesas y desarrollo de fuerza muscular.")
    esp_cardio = Especialidad(nombre="Cardio y Pilates", descripcion="Entrenamiento aeróbico, resistencia y flexibilidad.")
    db.add_all([esp_musc, esp_cardio])
    db.flush()

    # --- Objetivos ---
    obj_ganar = Objetivo(nombre="Ganar masa muscular", descripcion="Hipertrofia muscular y ganancia de peso saludable.")
    obj_perder = Objetivo(nombre="Perder grasa", descripcion="Déficit calórico, acondicionamiento físico general.")
    obj_def = Objetivo(nombre="Definición", descripcion="Tonificación muscular y mantenimiento de fuerza.")
    obj_res = Objetivo(nombre="Resistencia", descripcion="Mejorar capacidad cardiovascular y aguante muscular.")
    obj_salud = Objetivo(nombre="Salud general", descripcion="Mantenimiento físico, movilidad y bienestar general.")
    db.add_all([obj_ganar, obj_perder, obj_def, obj_res, obj_salud])
    db.flush()

    # --- Grupos Musculares ---
    gm_inferior = GrupoMuscular(nombre="Tren Inferior", descripcion="Piernas, glúteos y pantorrillas.")
    gm_pecho = GrupoMuscular(nombre="Pecho", descripcion="Pectoral mayor y menor.")
    gm_espalda = GrupoMuscular(nombre="Espalda", descripcion="Dorsales, trapecios y lumbares.")
    gm_brazos = GrupoMuscular(nombre="Brazos", descripcion="Bíceps, tríceps y antebrazos.")
    db.add_all([gm_inferior, gm_pecho, gm_espalda, gm_brazos])
    db.flush()

    # --- Membresías de catálogo ---
    memb_mensual = Membresia(nombre="Mensual Premium", precio=decimal.Decimal("50.00"), duracion_dias=30, activa=True)
    memb_trimestral = Membresia(nombre="Trimestral", precio=decimal.Decimal("135.00"), duracion_dias=90, activa=True)
    memb_anual = Membresia(nombre="Anual", precio=decimal.Decimal("480.00"), duracion_dias=365, activa=True)
    db.add_all([memb_mensual, memb_trimestral, memb_anual])
    db.flush()

    # --- Usuarios & Extensiones ---
    
    # 1. Admin
    admin_user = Usuario(
        nombre="Abraham",
        apellido="Gómez",
        dni="111111111111",
        correo="admin@gleyforgym.com",
        telefono="809-555-0000",
        password_hash=get_password_hash("admin1234"),
        rol="ADMINISTRADOR",
        activo=True
    )
    db.add(admin_user)

    # 2. Entrenadores
    e1_user = Usuario(
        nombre="Carlos",
        apellido="Ramírez",
        dni="222222222222",
        correo="carlos.ramirez@gleyforgym.com",
        telefono="809-555-1234",
        password_hash=get_password_hash("carlos1234"),
        rol="ENTRENADOR",
        activo=True
    )
    e2_user = Usuario(
        nombre="Sofía",
        apellido="Castro",
        dni="333333333333",
        correo="sofia.castro@gleyforgym.com",
        telefono="809-555-4567",
        password_hash=get_password_hash("sofia1234"),
        rol="ENTRENADOR",
        activo=True
    )
    db.add_all([e1_user, e2_user])
    db.flush()

    e1 = Entrenador(usuario_id=e1_user.id, experiencia_anios=5, activo=True)
    e2 = Entrenador(usuario_id=e2_user.id, experiencia_anios=3, activo=True)
    db.add_all([e1, e2])
    db.flush()

    # Asociar especialidades a entrenadores
    db.add_all([
        EntrenadorEspecialidad(entrenador_id=e1.id, especialidad_id=esp_musc.id),
        EntrenadorEspecialidad(entrenador_id=e2.id, especialidad_id=esp_cardio.id)
    ])

    # 3. Clientes
    clientes_data = [
        {"nombre": "María", "apellido": "González", "dni": "444444444444", "correo": "maria.gonzalez@email.com", "tel": "809-555-5678", "pass": "maria1234", "obj": obj_perder, "peso": 70.5, "alt": 1.65},
        {"nombre": "José", "apellido": "Martínez", "dni": "555555555555", "correo": "jose.martinez@email.com", "tel": "809-555-9012", "pass": "jose1234", "obj": obj_ganar, "peso": 82.0, "alt": 1.78},
        {"nombre": "Ana", "apellido": "López", "dni": "666666666666", "correo": "ana.lopez@email.com", "tel": "809-555-3456", "pass": "ana1234", "obj": obj_def, "peso": 55.0, "alt": 1.60},
        {"nombre": "Laura", "apellido": "Díaz", "dni": "777777777777", "correo": "laura.diaz@email.com", "tel": "809-555-2345", "pass": "laura1234", "obj": obj_salud, "peso": 64.0, "alt": 1.68}
    ]

    db_clientes = []
    for c in clientes_data:
        u_cli = Usuario(
            nombre=c["nombre"],
            apellido=c["apellido"],
            dni=c["dni"],
            correo=c["correo"],
            telefono=c["tel"],
            password_hash=get_password_hash(c["pass"]),
            rol="CLIENTE",
            activo=True
        )
        db.add(u_cli)
        db.flush()

        cli = Cliente(
            usuario_id=u_cli.id,
            objetivo_id=c["obj"].id,
            peso=decimal.Decimal(str(c["peso"])),
            altura=decimal.Decimal(str(c["alt"])),
            fecha_nacimiento=date.today() - timedelta(days=365*25),
            sexo="Femenino" if c["nombre"] in ["María", "Ana", "Laura"] else "Masculino",
            direccion="Calle Principal #123, Santo Domingo",
            restricciones_medicas="Ninguna",
            activo=True
        )
        db.add(cli)
        db_clientes.append(cli)
    db.flush()

    # --- Asignaciones Cliente - Entrenador ---
    db.add_all([
        ClienteEntrenador(cliente_id=db_clientes[0].id, entrenador_id=e1.id, activo=True),
        ClienteEntrenador(cliente_id=db_clientes[1].id, entrenador_id=e1.id, activo=True),
        ClienteEntrenador(cliente_id=db_clientes[2].id, entrenador_id=e2.id, activo=True),
        ClienteEntrenador(cliente_id=db_clientes[3].id, entrenador_id=e2.id, activo=True),
    ])

    # --- Membresías de Clientes ---
    cm1 = ClienteMembresia(cliente_id=db_clientes[0].id, membresia_id=memb_mensual.id, fecha_inicio=date.today() - timedelta(days=10), fecha_fin=date.today() + timedelta(days=20), estado="ACTIVA")
    cm2 = ClienteMembresia(cliente_id=db_clientes[1].id, membresia_id=memb_trimestral.id, fecha_inicio=date.today() - timedelta(days=45), fecha_fin=date.today() + timedelta(days=45), estado="ACTIVA")
    cm3 = ClienteMembresia(cliente_id=db_clientes[2].id, membresia_id=memb_anual.id, fecha_inicio=date.today() - timedelta(days=100), fecha_fin=date.today() + timedelta(days=265), estado="ACTIVA")
    cm4 = ClienteMembresia(cliente_id=db_clientes[3].id, membresia_id=memb_mensual.id, fecha_inicio=date.today() - timedelta(days=40), fecha_fin=date.today() - timedelta(days=10), estado="VENCIDA")
    db.add_all([cm1, cm2, cm3, cm4])
    db.flush()

    # --- Pagos ---
    db.add_all([
        Pago(cliente_membresia_id=cm1.id, monto=decimal.Decimal("50.00"), metodo_pago="TARJETA", estado="PAGADO", fecha_pago=date.today() - timedelta(days=10), observacion="Pago membresía mensual"),
        Pago(cliente_membresia_id=cm2.id, monto=decimal.Decimal("135.00"), metodo_pago="TRANSFERENCIA", estado="PAGADO", fecha_pago=date.today() - timedelta(days=45), observacion="Pago membresía trimestral"),
        Pago(cliente_membresia_id=cm3.id, monto=decimal.Decimal("480.00"), metodo_pago="EFECTIVO", estado="PAGADO", fecha_pago=date.today() - timedelta(days=100), observacion="Pago membresía anual"),
        Pago(cliente_membresia_id=cm4.id, monto=decimal.Decimal("50.00"), metodo_pago="EFECTIVO", estado="PAGADO", fecha_pago=date.today() - timedelta(days=40), observacion="Membresía anterior"),
    ])

    # --- Asistencias ---
    db.add_all([
        Asistencia(cliente_id=db_clientes[0].id, entrenador_id=e1.id, fecha=date.today(), hora_entrada=time(8, 0), hora_salida=time(9, 30), estado="ASISTIO", observaciones="Excelente entrenamiento de pierna"),
        Asistencia(cliente_id=db_clientes[1].id, entrenador_id=e1.id, fecha=date.today(), hora_entrada=time(9, 15), hora_salida=time(10, 45), estado="ASISTIO", observaciones="Rutina de pecho completada"),
        Asistencia(cliente_id=db_clientes[2].id, entrenador_id=e2.id, fecha=date.today() - timedelta(days=1), hora_entrada=time(17, 0), hora_salida=time(18, 0), estado="ASISTIO", observaciones="Clase de pilates"),
    ])

    # --- Progreso Clientes ---
    db.add_all([
        ProgresoCliente(cliente_id=db_clientes[0].id, fecha=date.today() - timedelta(days=30), peso=decimal.Decimal("72.00"), altura=decimal.Decimal("1.65"), imc=decimal.Decimal("26.45"), notas="Peso inicial"),
        ProgresoCliente(cliente_id=db_clientes[0].id, fecha=date.today(), peso=decimal.Decimal("70.50"), altura=decimal.Decimal("1.65"), imc=decimal.Decimal("25.89"), notas="Reducción de grasa corporal"),
        ProgresoCliente(cliente_id=db_clientes[1].id, fecha=date.today(), peso=decimal.Decimal("82.00"), altura=decimal.Decimal("1.78"), imc=decimal.Decimal("25.88"), notas="Ganancia muscular limpia"),
    ])

    # --- Ejercicios Catalogo ---
    sentadilla = Ejercicio(nombre="Sentadilla Libre", descripcion="Sentadilla profunda con barra olímpica", grupo_muscular_id=gm_inferior.id, nivel="principiante")
    press_banca = Ejercicio(nombre="Press de Banca", descripcion="Press horizontal con barra", grupo_muscular_id=gm_pecho.id, nivel="principiante")
    peso_muerto = Ejercicio(nombre="Peso Muerto", descripcion="Peso muerto convencional", grupo_muscular_id=gm_espalda.id, nivel="intermedio")
    curl_biceps = Ejercicio(nombre="Curl de Bíceps", descripcion="Curl con barra Z de pie", grupo_muscular_id=gm_brazos.id, nivel="principiante")
    db.add_all([sentadilla, press_banca, peso_muerto, curl_biceps])
    db.flush()

    # --- Rutinas ---
    rutina_maria = Rutina(
        nombre="Rutina de Piernas y Glúteos",
        cliente_id=db_clientes[0].id,
        entrenador_id=e1.id,
        objetivo_id=obj_def.id,
        nivel="principiante",
        fecha_creacion=date.today(),
        activa=True,
        descripcion="Enfoque en tren inferior con cargas moderadas"
    )
    db.add(rutina_maria)
    db.flush()

    db.add_all([
        RutinaEjercicio(rutina_id=rutina_maria.id, ejercicio_id=sentadilla.id, series=4, repeticiones="12", descanso_segundos=90, dia_semana="Lunes", orden=1, notas="Mantener la espalda recta"),
        RutinaEjercicio(rutina_id=rutina_maria.id, ejercicio_id=curl_biceps.id, series=3, repeticiones="15", descanso_segundos=60, dia_semana="Miércoles", orden=2, notas="Concentrar el esfuerzo")
    ])

    db.commit()
    print("¡Base de datos sembrada con éxito!")
