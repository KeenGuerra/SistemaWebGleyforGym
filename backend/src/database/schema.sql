-- DDL para el nuevo modelo de base de datos GleyforGym en PostgreSQL

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    dni VARCHAR(12) UNIQUE NOT NULL,
    correo VARCHAR(120) UNIQUE NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL, -- 'ADMINISTRADOR', 'ENTRENADOR', 'CLIENTE'
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_registro DATE DEFAULT CURRENT_DATE NOT NULL,
    avatar VARCHAR(255)
);

-- 2. Tabla de Objetivos
CREATE TABLE IF NOT EXISTS objetivos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- 3. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    objetivo_id INTEGER REFERENCES objetivos(id) ON DELETE SET NULL,
    peso NUMERIC(5,2),
    altura NUMERIC(4,2),
    fecha_nacimiento DATE,
    sexo VARCHAR(20),
    direccion TEXT,
    restricciones_medicas TEXT,
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- 4. Tabla de Entrenadores
CREATE TABLE IF NOT EXISTS entrenadores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    experiencia_anios INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- 5. Tabla de Especialidades
CREATE TABLE IF NOT EXISTS especialidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
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
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    duracion_dias INTEGER NOT NULL,
    activa BOOLEAN DEFAULT TRUE NOT NULL
);

-- 8. Tabla de Cliente Membresías (Suscripciones)
CREATE TABLE IF NOT EXISTS cliente_membresias (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    membresia_id INTEGER NOT NULL REFERENCES membresias(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL -- 'ACTIVA', 'VENCIDA', 'CANCELADA'
);

-- 9. Tabla de Pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    cliente_membresia_id INTEGER NOT NULL REFERENCES cliente_membresias(id) ON DELETE CASCADE,
    monto NUMERIC(10,2) NOT NULL,
    fecha_pago DATE DEFAULT CURRENT_DATE NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL, -- 'EFECTIVO', 'TARJETA', 'TRANSFERENCIA'
    estado VARCHAR(20) NOT NULL, -- 'PAGADO', 'PENDIENTE', 'ANULADO'
    comprobante VARCHAR(255),
    observacion TEXT
);

-- 10. Tabla de Asistencias
CREATE TABLE IF NOT EXISTS asistencias (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    entrenador_id INTEGER REFERENCES entrenadores(id) ON DELETE SET NULL,
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    hora_entrada VARCHAR(50) NOT NULL,
    hora_salida VARCHAR(50),
    estado VARCHAR(20) NOT NULL, -- e.g., 'ASISTIO', 'TARDE', 'FALTA'
    observaciones TEXT
);

-- 11. Tabla de Progreso Clientes
CREATE TABLE IF NOT EXISTS progreso_clientes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    peso NUMERIC(5,2) NOT NULL,
    altura NUMERIC(4,2) NOT NULL,
    imc NUMERIC(5,2) NOT NULL,
    porcentaje_grasa NUMERIC(5,2),
    porcentaje_muscular NUMERIC(5,2),
    notas TEXT
);

-- 12. Tabla de Grupo Muscular
CREATE TABLE IF NOT EXISTS grupo_muscular (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- 13. Tabla de Ejercicios
CREATE TABLE IF NOT EXISTS ejercicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT,
    grupo_muscular_id INTEGER REFERENCES grupo_muscular(id) ON DELETE SET NULL,
    nivel VARCHAR(50),
    video_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- 14. Tabla de Rutinas
CREATE TABLE IF NOT EXISTS rutinas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    entrenador_id INTEGER NOT NULL REFERENCES entrenadores(id) ON DELETE CASCADE,
    objetivo_id INTEGER REFERENCES objetivos(id) ON DELETE SET NULL,
    nombre VARCHAR(80) NOT NULL,
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
    series INTEGER NOT NULL,
    repeticiones VARCHAR(50) NOT NULL,
    descanso_segundos INTEGER NOT NULL,
    dia_semana VARCHAR(50) NOT NULL,
    orden INTEGER NOT NULL,
    notas TEXT
);

-- 16. Tabla de Cliente Entrenador (Asignaciones)
CREATE TABLE IF NOT EXISTS cliente_entrenador (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    entrenador_id INTEGER NOT NULL REFERENCES entrenadores(id) ON DELETE CASCADE,
    fecha_asignacion DATE DEFAULT CURRENT_DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE NOT NULL
);

-- Índices requeridos
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON clientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_entrenadores_usuario_id ON entrenadores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_rutinas_cliente_id ON rutinas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_rutinas_entrenador_id ON rutinas(entrenador_id);
CREATE INDEX IF NOT EXISTS idx_progreso_clientes_cliente_id ON progreso_clientes(cliente_id);

-- PROCEDIMIENTOS ALMACENADOS / FUNCIONES EN POSTGRESQL

-- 1. registrar_pago
CREATE OR REPLACE FUNCTION registrar_pago(
    p_cliente_membresia_id INTEGER,
    p_monto NUMERIC(10,2),
    p_metodo_pago VARCHAR(50),
    p_estado VARCHAR(20),
    p_comprobante VARCHAR(255),
    p_observacion TEXT,
    p_fecha_pago DATE DEFAULT CURRENT_DATE
) RETURNS INTEGER AS $$
DECLARE
    v_pago_id INTEGER;
BEGIN
    INSERT INTO pagos (cliente_membresia_id, monto, fecha_pago, metodo_pago, estado, comprobante, observacion)
    VALUES (p_cliente_membresia_id, p_monto, p_fecha_pago, p_metodo_pago, p_estado, p_comprobante, p_observacion)
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

-- 2. registrar_asistencia
CREATE OR REPLACE FUNCTION registrar_asistencia(
    p_cliente_id INTEGER,
    p_entrenador_id INTEGER,
    p_hora_entrada VARCHAR(50),
    p_hora_salida VARCHAR(50),
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

-- 3. renovar_membresia
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
    -- Obtener duración en días del catálogo de membresía
    SELECT duracion_dias INTO v_duracion_dias FROM membresias WHERE id = p_membresia_id;
    
    IF v_duracion_dias IS NULL THEN
        RAISE EXCEPTION 'Membresía no encontrada';
    END IF;
    
    v_fecha_fin := p_fecha_inicio + v_duracion_dias;
    
    -- Cambiar cualquier membresía ACTIVA previa a VENCIDA o CANCELADA
    UPDATE cliente_membresias
    SET estado = 'VENCIDA'
    WHERE cliente_id = p_cliente_id AND estado = 'ACTIVA';
    
    -- Insertar nueva membresía
    INSERT INTO cliente_membresias (cliente_id, membresia_id, fecha_inicio, fecha_fin, estado)
    VALUES (p_cliente_id, p_membresia_id, p_fecha_inicio, v_fecha_fin, 'ACTIVA')
    RETURNING id INTO v_cliente_membresia_id;
    
    RETURN v_cliente_membresia_id;
END;
$$ LANGUAGE plpgsql;

-- 4. calcular_imc
CREATE OR REPLACE FUNCTION calcular_imc(
    p_peso NUMERIC(5,2),
    p_altura NUMERIC(4,2)
) RETURNS NUMERIC(5,2) AS $$
BEGIN
    IF p_altura IS NULL OR p_altura = 0 THEN
        RETURN 0.00;
    END IF;
    RETURN ROUND(p_peso / (p_altura * p_altura), 2);
END;
$$ LANGUAGE plpgsql;

-- 5. actualizar_estado_membresias
CREATE OR REPLACE FUNCTION actualizar_estado_membresias() 
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Pone vencidas las membresías activas que ya pasaron su fecha_fin
    UPDATE cliente_membresias
    SET estado = 'VENCIDA'
    WHERE estado = 'ACTIVA' AND fecha_fin < CURRENT_DATE;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;
