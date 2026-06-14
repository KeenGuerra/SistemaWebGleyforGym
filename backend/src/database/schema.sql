-- DDL para el nuevo modelo de base de datos GleyforGym en PostgreSQL
-- Optimizado con restricciones, tipos específicos y checks.

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    dni VARCHAR(12) UNIQUE NOT NULL,
    correo VARCHAR(120) UNIQUE NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'ENTRENADOR', 'CLIENTE')),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_registro DATE DEFAULT CURRENT_DATE NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    avatar TEXT
);

-- 2. Tabla de Objetivos
CREATE TABLE IF NOT EXISTS objetivos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- 3. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    objetivo_id INTEGER REFERENCES objetivos(id) ON DELETE SET NULL,
    peso NUMERIC(6,2) CHECK (peso IS NULL OR (peso > 0.00 AND peso < 300.00)),
    altura NUMERIC(4,2) CHECK (altura IS NULL OR (altura > 0.00 AND altura < 3.00)), -- en metros
    fecha_nacimiento DATE,
    sexo VARCHAR(20),
    direccion TEXT,
    restricciones_medicas TEXT,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Tabla de Entrenadores
CREATE TABLE IF NOT EXISTS entrenadores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    experiencia_anios SMALLINT NOT NULL CHECK (experiencia_anios >= 0),
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- 5. Tabla de Especialidades
CREATE TABLE IF NOT EXISTS especialidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE NOT NULL
);

-- 6. Tabla Intermedia Entrenador Especialidades
CREATE TABLE IF NOT EXISTS entrenador_especialidades (
    id SERIAL PRIMARY KEY,
    entrenador_id INTEGER NOT NULL REFERENCES entrenadores(id) ON DELETE CASCADE,
    especialidad_id INTEGER NOT NULL REFERENCES especialidades(id) ON DELETE CASCADE,
    UNIQUE(entrenador_id, especialidad_id)
);

-- 7. Tabla de Membresías (Catálogo)
CREATE TABLE IF NOT EXISTS membresias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0.00),
    duracion_dias INTEGER NOT NULL CHECK (duracion_dias > 0),
    activa BOOLEAN DEFAULT TRUE NOT NULL
);

-- 8. Tabla de Cliente Membresías (Suscripciones)
CREATE TABLE IF NOT EXISTS cliente_membresias (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    membresia_id INTEGER NOT NULL REFERENCES membresias(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ACTIVA', 'VENCIDA', 'CANCELADA', 'PENDIENTE')),
    CONSTRAINT chk_fechas_membresia CHECK (fecha_fin >= fecha_inicio)
);

-- 9. Tabla de Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    cliente_membresia_id INTEGER NOT NULL REFERENCES cliente_membresias(id) ON DELETE CASCADE,
    monto NUMERIC(10,2) NOT NULL CHECK (monto > 0.00),
    fecha_pago DATE DEFAULT CURRENT_DATE NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PAGADO', 'PENDIENTE', 'ANULADO')),
    comprobante TEXT,
    observacion TEXT
);

-- 10. Tabla de Asistencias
CREATE TABLE IF NOT EXISTS asistencias (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    entrenador_id INTEGER REFERENCES entrenadores(id) ON DELETE SET NULL,
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ASISTIO', 'TARDE', 'FALTA')),
    observaciones TEXT,
    CONSTRAINT chk_horas_asistencia CHECK (hora_salida IS NULL OR hora_salida > hora_entrada)
);

-- 11. Tabla de Progreso Clientes
CREATE TABLE IF NOT EXISTS progreso_clientes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    peso NUMERIC(6,2) NOT NULL CHECK (peso > 0.00 AND peso < 300.00),
    altura NUMERIC(4,2) NOT NULL CHECK (altura > 0.00 AND altura < 3.00),
    imc NUMERIC(5,2) NOT NULL,
    porcentaje_grasa NUMERIC(5,2) CHECK (porcentaje_grasa IS NULL OR (porcentaje_grasa >= 0.00 AND porcentaje_grasa <= 100.00)),
    porcentaje_muscular NUMERIC(5,2) CHECK (porcentaje_muscular IS NULL OR (porcentaje_muscular >= 0.00 AND porcentaje_muscular <= 100.00)),
    notas TEXT
);

-- 12. Tabla de Grupo Muscular (Catálogo)
CREATE TABLE IF NOT EXISTS grupo_muscular (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- 13. Tabla de Ejercicios
CREATE TABLE IF NOT EXISTS ejercicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    grupo_muscular_id INTEGER REFERENCES grupo_muscular(id) ON DELETE SET NULL,
    nivel VARCHAR(50),
    video_url TEXT,
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- 14. Tabla de Rutinas
CREATE TABLE IF NOT EXISTS rutinas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    entrenador_id INTEGER NOT NULL REFERENCES entrenadores(id) ON DELETE CASCADE,
    objetivo_id INTEGER REFERENCES objetivos(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    nivel VARCHAR(50) NOT NULL,
    fecha_creacion DATE DEFAULT CURRENT_DATE NOT NULL,
    activa BOOLEAN DEFAULT TRUE NOT NULL
);

-- 15. Tabla de Rutina Ejercicios
CREATE TABLE IF NOT EXISTS rutina_ejercicios (
    id SERIAL PRIMARY KEY,
    rutina_id INTEGER NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
    ejercicio_id INTEGER NOT NULL REFERENCES ejercicios(id) ON DELETE CASCADE,
    series SMALLINT NOT NULL CHECK (series > 0),
    repeticiones VARCHAR(50) NOT NULL,
    descanso_segundos INTEGER NOT NULL CHECK (descanso_segundos >= 0),
    dia_semana VARCHAR(20) NOT NULL,
    orden INTEGER NOT NULL CHECK (orden > 0),
    notas TEXT,
    UNIQUE(rutina_id, dia_semana, orden)
);

-- 16. Tabla de Cliente Entrenador (Asignaciones)
CREATE TABLE IF NOT EXISTS cliente_entrenador (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    entrenador_id INTEGER NOT NULL REFERENCES entrenadores(id) ON DELETE CASCADE,
    fecha_asignacion DATE DEFAULT CURRENT_DATE NOT NULL,
    fecha_fin DATE NULL,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT chk_fechas_asignacion CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_asignacion)
);

-- Índices requeridos (Claves foráneas y búsquedas recurrentes)
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON clientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_clientes_objetivo_id ON clientes(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_entrenadores_usuario_id ON entrenadores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_entrenador_especialidades_entrenador ON entrenador_especialidades(entrenador_id);
CREATE INDEX IF NOT EXISTS idx_entrenador_especialidades_especialidad ON entrenador_especialidades(especialidad_id);
CREATE INDEX IF NOT EXISTS idx_cliente_membresias_cliente_id ON cliente_membresias(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_membresias_membresia_id ON cliente_membresias(membresia_id);
CREATE INDEX IF NOT EXISTS idx_pagos_cliente_membresia ON pagos(cliente_membresia_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_asistencias_cliente_id ON asistencias(cliente_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_entrenador_id ON asistencias(entrenador_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_progreso_clientes_cliente_id ON progreso_clientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ejercicios_grupo_muscular ON ejercicios(grupo_muscular_id);
CREATE INDEX IF NOT EXISTS idx_rutinas_cliente_id ON rutinas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_rutinas_entrenador_id ON rutinas(entrenador_id);
CREATE INDEX IF NOT EXISTS idx_rutinas_objetivo_id ON rutinas(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_rutina_ejercicios_rutina ON rutina_ejercicios(rutina_id);
CREATE INDEX IF NOT EXISTS idx_rutina_ejercicios_ejercicio ON rutina_ejercicios(ejercicio_id);
CREATE INDEX IF NOT EXISTS idx_cliente_entrenador_cliente ON cliente_entrenador(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_entrenador_entrenador ON cliente_entrenador(entrenador_id);

-- Restricciones de exclusión y de control para evitar duplicados activos

-- 1. Evitar que se repita la misma asignación de entrenador ACTIVA al mismo cliente
CREATE UNIQUE INDEX IF NOT EXISTS idx_cliente_entrenador_activo ON cliente_entrenador (cliente_id, entrenador_id) WHERE activo = TRUE;

-- 2. No permitir dos asistencias abiertas (sin hora de salida) para el mismo cliente en la misma fecha
CREATE UNIQUE INDEX IF NOT EXISTS idx_asistencias_abiertas ON asistencias (cliente_id, fecha) WHERE hora_salida IS NULL;


-- PROCEDIMIENTOS ALMACENADOS & FUNCIONES EN POSTGRESQL

-- 1. registrar_pago (Función & Procedimiento)
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
    IF p_monto <= 0.00 THEN
        RAISE EXCEPTION 'El monto del pago debe ser positivo';
    END IF;
    
    INSERT INTO pagos (cliente_membresia_id, monto, fecha_pago, metodo_pago, estado, comprobante, observacion)
    VALUES (p_cliente_membresia_id, p_monto, COALESCE(p_fecha_pago, CURRENT_DATE), p_metodo_pago, p_estado, p_comprobante, p_observacion)
    RETURNING id INTO v_pago_id;
    
    -- Si el pago está PAGADO, podemos activar la membresía
    IF p_estado = 'PAGADO' THEN
        UPDATE cliente_membresias
        SET estado = 'ACTIVA'
        WHERE id = p_cliente_membresia_id;
    END IF;
    
    RETURN v_pago_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE registrar_pago_proc(
    p_cliente_membresia_id INTEGER,
    p_monto NUMERIC(10,2),
    p_metodo_pago VARCHAR(50),
    p_estado VARCHAR(20),
    p_comprobante TEXT,
    p_observacion TEXT,
    p_fecha_pago DATE,
    INOUT p_pago_id INTEGER DEFAULT NULL
) AS $$
BEGIN
    SELECT registrar_pago(p_cliente_membresia_id, p_monto, p_metodo_pago, p_estado, p_comprobante, p_observacion, p_fecha_pago) INTO p_pago_id;
END;
$$ LANGUAGE plpgsql;


-- 2. registrar_asistencia (Función & Procedimiento)
CREATE OR REPLACE FUNCTION registrar_asistencia(
    p_cliente_id INTEGER,
    p_entrenador_id INTEGER,
    p_fecha DATE,
    p_hora_entrada TIME,
    p_hora_salida TIME,
    p_estado VARCHAR(20),
    p_observaciones TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_asistencia_id INTEGER;
BEGIN
    INSERT INTO asistencias (cliente_id, entrenador_id, fecha, hora_entrada, hora_salida, estado, observaciones)
    VALUES (p_cliente_id, p_entrenador_id, COALESCE(p_fecha, CURRENT_DATE), p_hora_entrada, p_hora_salida, p_estado, p_observaciones)
    RETURNING id INTO v_asistencia_id;
    
    RETURN v_asistencia_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE registrar_asistencia_proc(
    p_cliente_id INTEGER,
    p_entrenador_id INTEGER,
    p_fecha DATE,
    p_hora_entrada TIME,
    p_hora_salida TIME,
    p_estado VARCHAR(20),
    p_observaciones TEXT,
    INOUT p_asistencia_id INTEGER DEFAULT NULL
) AS $$
BEGIN
    SELECT registrar_asistencia(p_cliente_id, p_entrenador_id, p_fecha, p_hora_entrada, p_hora_salida, p_estado, p_observaciones) INTO p_asistencia_id;
END;
$$ LANGUAGE plpgsql;


-- 3. renovar_membresia (Función & Procedimiento)
CREATE OR REPLACE FUNCTION renovar_membresia(
    p_cliente_id INTEGER,
    p_membresia_id INTEGER,
    p_fecha_inicio DATE
) RETURNS INTEGER AS $$
DECLARE
    v_duracion_dias INTEGER;
    v_fecha_fin DATE;
    v_cliente_membresia_id INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Reemplazar cuerpo renovar_membresia con cálculo correcto
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

CREATE OR REPLACE PROCEDURE renovar_membresia_proc(
    p_cliente_id INTEGER,
    p_membresia_id INTEGER,
    p_fecha_inicio DATE,
    INOUT p_cliente_membresia_id INTEGER DEFAULT NULL
) AS $$
BEGIN
    SELECT renovar_membresia(p_cliente_id, p_membresia_id, p_fecha_inicio) INTO p_cliente_membresia_id;
END;
$$ LANGUAGE plpgsql;


-- 4. calcular_imc (Función de Utilidad)
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


-- 5. actualizar_estado_membresias (Función & Procedimiento)
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

CREATE OR REPLACE PROCEDURE actualizar_estado_membresias_proc(
    OUT p_updated_count INTEGER
) AS $$
BEGIN
    SELECT actualizar_estado_membresias() INTO p_updated_count;
END;
$$ LANGUAGE plpgsql;


-- 6. asignar_cliente_entrenador (Función & Procedimiento)
CREATE OR REPLACE FUNCTION asignar_cliente_entrenador(
    p_cliente_id INTEGER,
    p_entrenador_id INTEGER,
    p_fecha_asignacion DATE DEFAULT CURRENT_DATE
) RETURNS INTEGER AS $$
DECLARE
    v_asignacion_id INTEGER;
    v_exists INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_exists 
    FROM cliente_entrenador 
    WHERE cliente_id = p_cliente_id AND activo = TRUE;
    
    IF v_exists > 0 THEN
        RAISE EXCEPTION 'El cliente ya tiene un entrenador asignado activo';
    END IF;
    
    INSERT INTO cliente_entrenador (cliente_id, entrenador_id, fecha_asignacion, activo)
    VALUES (p_cliente_id, p_entrenador_id, COALESCE(p_fecha_asignacion, CURRENT_DATE), TRUE)
    RETURNING id INTO v_asignacion_id;
    
    RETURN v_asignacion_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE asignar_cliente_entrenador_proc(
    p_cliente_id INTEGER,
    p_entrenador_id INTEGER,
    p_fecha_asignacion DATE,
    INOUT p_asignacion_id INTEGER DEFAULT NULL
) AS $$
BEGIN
    SELECT asignar_cliente_entrenador(p_cliente_id, p_entrenador_id, p_fecha_asignacion) INTO p_asignacion_id;
END;
$$ LANGUAGE plpgsql;


-- 7. registrar_progreso_cliente (Función & Procedimiento)
CREATE OR REPLACE FUNCTION registrar_progreso_cliente(
    p_cliente_id INTEGER,
    p_fecha DATE,
    p_peso NUMERIC(6,2),
    p_altura NUMERIC(4,2),
    p_porcentaje_grasa NUMERIC(5,2),
    p_porcentaje_muscular NUMERIC(5,2),
    p_notas TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_progreso_id INTEGER;
    v_imc NUMERIC(5,2);
BEGIN
    IF p_peso <= 0.00 OR p_peso >= 300.00 THEN
        RAISE EXCEPTION 'Peso fuera de rango válido';
    END IF;
    IF p_altura <= 0.00 OR p_altura >= 3.00 THEN
        RAISE EXCEPTION 'Altura fuera de rango válido';
    END IF;
    
    v_imc := ROUND(p_peso / (p_altura * p_altura), 2);
    
    INSERT INTO progreso_clientes (cliente_id, fecha, peso, altura, imc, porcentaje_grasa, porcentaje_muscular, notas)
    VALUES (p_cliente_id, COALESCE(p_fecha, CURRENT_DATE), p_peso, p_altura, v_imc, p_porcentaje_grasa, p_porcentaje_muscular, p_notas)
    RETURNING id INTO v_progreso_id;
    
    RETURN v_progreso_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE registrar_progreso_cliente_proc(
    p_cliente_id INTEGER,
    p_fecha DATE,
    p_peso NUMERIC(6,2),
    p_altura NUMERIC(4,2),
    p_porcentaje_grasa NUMERIC(5,2),
    p_porcentaje_muscular NUMERIC(5,2),
    p_notas TEXT,
    INOUT p_progreso_id INTEGER DEFAULT NULL
) AS $$
BEGIN
    SELECT registrar_progreso_cliente(p_cliente_id, p_fecha, p_peso, p_altura, p_porcentaje_grasa, p_porcentaje_muscular, p_notas) INTO p_progreso_id;
END;
$$ LANGUAGE plpgsql;


-- TRIGGERS DE BASE DE DATOS

-- Trigger 1: Calcular IMC automáticamente en progreso_clientes
CREATE OR REPLACE FUNCTION fn_trg_calcular_imc()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.altura IS NOT NULL AND NEW.altura > 0 THEN
        NEW.imc := ROUND(NEW.peso / (NEW.altura * NEW.altura), 2);
    ELSE
        NEW.imc := 0.00;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_calcular_imc
BEFORE INSERT OR UPDATE ON progreso_clientes
FOR EACH ROW
EXECUTE FUNCTION fn_trg_calcular_imc();


-- Trigger 2: Actualizar estado de membresías según fecha_fin
CREATE OR REPLACE FUNCTION fn_trg_actualizar_estado_membresia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_fin < CURRENT_DATE AND NEW.estado = 'ACTIVA' THEN
        NEW.estado := 'VENCIDA';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_actualizar_estado_membresia
BEFORE INSERT OR UPDATE ON cliente_membresias
FOR EACH ROW
EXECUTE FUNCTION fn_trg_actualizar_estado_membresia();


-- Trigger 3: Actualizar fecha_modificacion automáticamente en usuarios y clientes
CREATE OR REPLACE FUNCTION fn_trg_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_fecha_modificacion_usuario
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION fn_trg_fecha_modificacion();

CREATE OR REPLACE TRIGGER trg_fecha_modificacion_cliente
BEFORE UPDATE ON clientes
FOR EACH ROW
EXECUTE FUNCTION fn_trg_fecha_modificacion();
