import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, Numeric, Date, DateTime, ForeignKey, Text, 
    Time, SmallInteger, CheckConstraint, UniqueConstraint, text
)
from sqlalchemy.orm import relationship
# pyrefly: ignore [missing-import]
# pyright: ignore [reportMissingImports]
from src.database.connection import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    dni = Column(String(12), unique=True, index=True, nullable=False)
    correo = Column(String(120), unique=True, index=True, nullable=False)
    telefono = Column(String(15), nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False)  # 'ADMINISTRADOR', 'ENTRENADOR', 'CLIENTE'
    activo = Column(Boolean, default=True, nullable=False)
    fecha_registro = Column(Date, default=datetime.date.today, nullable=False)
    fecha_modificacion = Column(DateTime, default=datetime.datetime.now, server_default=text("CURRENT_TIMESTAMP"), onupdate=datetime.datetime.now, nullable=False)
    avatar = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("rol IN ('ADMINISTRADOR', 'ENTRENADOR', 'CLIENTE')", name="chk_usuario_rol"),
    )

    # Relaciones de extensión
    cliente = relationship("Cliente", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    entrenador = relationship("Entrenador", back_populates="usuario", uselist=False, cascade="all, delete-orphan")


class Objetivo(Base):
    __tablename__ = "objetivos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    clientes = relationship("Cliente", back_populates="objetivo")
    rutinas = relationship("Rutina", back_populates="objetivo")


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False)
    objetivo_id = Column(Integer, ForeignKey("objetivos.id", ondelete="SET NULL"), nullable=True)
    peso = Column(Numeric(6, 2), nullable=True)
    altura = Column(Numeric(4, 2), nullable=True)  # en metros
    fecha_nacimiento = Column(Date, nullable=True)
    sexo = Column(String(20), nullable=True)
    direccion = Column(Text, nullable=True)
    restricciones_medicas = Column(Text, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)
    fecha_modificacion = Column(DateTime, default=datetime.datetime.now, server_default=text("CURRENT_TIMESTAMP"), onupdate=datetime.datetime.now, nullable=False)

    __table_args__ = (
        CheckConstraint("peso IS NULL OR (peso > 0.00 AND peso < 300.00)", name="chk_cliente_peso"),
        CheckConstraint("altura IS NULL OR (altura > 0.00 AND altura < 3.00)", name="chk_cliente_altura"),
    )

    # Relaciones
    usuario = relationship("Usuario", back_populates="cliente")
    objetivo = relationship("Objetivo", back_populates="clientes")
    asignaciones_entrenador = relationship("ClienteEntrenador", back_populates="cliente", cascade="all, delete-orphan")
    membresias_cliente = relationship("ClienteMembresia", back_populates="cliente", cascade="all, delete-orphan")
    asistencias = relationship("Asistencia", back_populates="cliente", cascade="all, delete-orphan")
    progresos = relationship("ProgresoCliente", back_populates="cliente", cascade="all, delete-orphan")
    rutinas = relationship("Rutina", back_populates="cliente", cascade="all, delete-orphan")


class Entrenador(Base):
    __tablename__ = "entrenadores"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False)
    experiencia_anios = Column(SmallInteger, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        CheckConstraint("experiencia_anios >= 0", name="chk_entrenador_experiencia"),
    )

    # Relaciones
    usuario = relationship("Usuario", back_populates="entrenador")
    especialidades = relationship("Especialidad", secondary="entrenador_especialidades", back_populates="entrenadores")
    asignaciones_cliente = relationship("ClienteEntrenador", back_populates="entrenador", cascade="all, delete-orphan")
    asistencias_registradas = relationship("Asistencia", back_populates="entrenador")
    rutinas_creadas = relationship("Rutina", back_populates="entrenador")


class Especialidad(Base):
    __tablename__ = "especialidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    activa = Column(Boolean, default=True, nullable=False)

    entrenadores = relationship("Entrenador", secondary="entrenador_especialidades", back_populates="especialidades")


class EntrenadorEspecialidad(Base):
    __tablename__ = "entrenador_especialidades"

    id = Column(Integer, primary_key=True, index=True)
    entrenador_id = Column(Integer, ForeignKey("entrenadores.id", ondelete="CASCADE"), nullable=False)
    especialidad_id = Column(Integer, ForeignKey("especialidades.id", ondelete="CASCADE"), nullable=False)


class Membresia(Base):
    __tablename__ = "membresias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Numeric(10, 2), nullable=False)
    duracion_dias = Column(Integer, nullable=False)
    activa = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        CheckConstraint("precio >= 0.00", name="chk_membresia_precio"),
        CheckConstraint("duracion_dias > 0", name="chk_membresia_duracion"),
    )

    cliente_membresias = relationship("ClienteMembresia", back_populates="membresia", cascade="all, delete-orphan")


class ClienteMembresia(Base):
    __tablename__ = "cliente_membresias"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    membresia_id = Column(Integer, ForeignKey("membresias.id", ondelete="CASCADE"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    estado = Column(String(20), nullable=False)  # 'ACTIVA', 'VENCIDA', 'CANCELADA', 'PENDIENTE'

    __table_args__ = (
        CheckConstraint("fecha_fin >= fecha_inicio", name="chk_fechas_membresia"),
        CheckConstraint("estado IN ('ACTIVA', 'VENCIDA', 'CANCELADA', 'PENDIENTE')", name="chk_estado_membresia"),
    )

    cliente = relationship("Cliente", back_populates="membresias_cliente")
    membresia = relationship("Membresia", back_populates="cliente_membresias")
    pagos = relationship("Pago", back_populates="cliente_membresia", cascade="all, delete-orphan")


class Pago(Base):
    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_membresia_id = Column(Integer, ForeignKey("cliente_membresias.id", ondelete="CASCADE"), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    fecha_pago = Column(Date, default=datetime.date.today, nullable=False)
    metodo_pago = Column(String(50), nullable=False)  # 'EFECTIVO', 'TARJETA', 'TRANSFERENCIA'
    estado = Column(String(20), nullable=False)  # 'PAGADO', 'PENDIENTE', 'ANULADO'
    comprobante = Column(Text, nullable=True)
    observacion = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("monto > 0.00", name="chk_pago_monto"),
        CheckConstraint("metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')", name="chk_pago_metodo"),
        CheckConstraint("estado IN ('PAGADO', 'PENDIENTE', 'ANULADO')", name="chk_pago_estado"),
    )

    cliente_membresia = relationship("ClienteMembresia", back_populates="pagos")


class Asistencia(Base):
    __tablename__ = "asistencias"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    entrenador_id = Column(Integer, ForeignKey("entrenadores.id", ondelete="SET NULL"), nullable=True)
    fecha = Column(Date, default=datetime.date.today, nullable=False)
    hora_entrada = Column(Time, nullable=False)
    hora_salida = Column(Time, nullable=True)
    estado = Column(String(20), nullable=False)  # 'ASISTIO', 'TARDE', 'FALTA'
    observaciones = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("hora_salida IS NULL OR hora_salida > hora_entrada", name="chk_horas_asistencia"),
        CheckConstraint("estado IN ('ASISTIO', 'TARDE', 'FALTA')", name="chk_asistencia_estado"),
    )

    cliente = relationship("Cliente", back_populates="asistencias")
    entrenador = relationship("Entrenador", back_populates="asistencias_registradas")


class ProgresoCliente(Base):
    __tablename__ = "progreso_clientes"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    fecha = Column(Date, default=datetime.date.today, nullable=False)
    peso = Column(Numeric(6, 2), nullable=False)
    altura = Column(Numeric(4, 2), nullable=False)
    imc = Column(Numeric(5, 2), nullable=False)
    porcentaje_grasa = Column(Numeric(5, 2), nullable=True)
    porcentaje_muscular = Column(Numeric(5, 2), nullable=True)
    # Para ser consistentes con el nombre de la columna física en el esquema 'notas'
    notas = Column("notas", Text, nullable=True)

    __table_args__ = (
        CheckConstraint("peso > 0.00 AND peso < 300.00", name="chk_progreso_peso"),
        CheckConstraint("altura > 0.00 AND altura < 3.00", name="chk_progreso_altura"),
        CheckConstraint("porcentaje_grasa IS NULL OR (porcentaje_grasa >= 0.00 AND porcentaje_grasa <= 100.00)", name="chk_progreso_grasa"),
        CheckConstraint("porcentaje_muscular IS NULL OR (porcentaje_muscular >= 0.00 AND porcentaje_muscular <= 100.00)", name="chk_progreso_musculo"),
    )

    cliente = relationship("Cliente", back_populates="progresos")


class GrupoMuscular(Base):
    __tablename__ = "grupo_muscular"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    ejercicios = relationship("Ejercicio", back_populates="grupo_muscular")


class Ejercicio(Base):
    __tablename__ = "ejercicios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    grupo_muscular_id = Column(Integer, ForeignKey("grupo_muscular.id", ondelete="SET NULL"), nullable=True)
    nivel = Column(String(50), nullable=True)
    video_url = Column(Text, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    grupo_muscular = relationship("GrupoMuscular", back_populates="ejercicios")
    rutina_ejercicios = relationship("RutinaEjercicio", back_populates="ejercicio", cascade="all, delete-orphan")


class Rutina(Base):
    __tablename__ = "rutinas"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    entrenador_id = Column(Integer, ForeignKey("entrenadores.id", ondelete="CASCADE"), nullable=False)
    objetivo_id = Column(Integer, ForeignKey("objetivos.id", ondelete="SET NULL"), nullable=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    nivel = Column(String(50), nullable=False)  # 'principiante', 'intermedio', 'avanzado'
    fecha_creacion = Column(Date, default=datetime.date.today, nullable=False)
    activa = Column(Boolean, default=True, nullable=False)

    cliente = relationship("Cliente", back_populates="rutinas")
    entrenador = relationship("Entrenador", back_populates="rutinas_creadas")
    objetivo = relationship("Objetivo", back_populates="rutinas")
    ejercicios = relationship("RutinaEjercicio", back_populates="rutina", cascade="all, delete-orphan")


class RutinaEjercicio(Base):
    __tablename__ = "rutina_ejercicios"

    id = Column(Integer, primary_key=True, index=True)
    rutina_id = Column(Integer, ForeignKey("rutinas.id", ondelete="CASCADE"), nullable=False)
    ejercicio_id = Column(Integer, ForeignKey("ejercicios.id", ondelete="CASCADE"), nullable=False)
    series = Column(SmallInteger, nullable=False)
    repeticiones = Column(String(50), nullable=False)
    descanso_segundos = Column(Integer, nullable=False)
    dia_semana = Column(String(20), nullable=False)
    orden = Column(Integer, nullable=False)
    notas = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("series > 0", name="chk_rutina_ejercicio_series"),
        CheckConstraint("descanso_segundos >= 0", name="chk_rutina_ejercicio_descanso"),
        CheckConstraint("orden > 0", name="chk_rutina_ejercicio_orden"),
        UniqueConstraint("rutina_id", "dia_semana", "orden", name="uq_rutina_dia_orden"),
    )

    rutina = relationship("Rutina", back_populates="ejercicios")
    ejercicio = relationship("Ejercicio", back_populates="rutina_ejercicios")


class ClienteEntrenador(Base):
    __tablename__ = "cliente_entrenador"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    entrenador_id = Column(Integer, ForeignKey("entrenadores.id", ondelete="CASCADE"), nullable=False)
    fecha_asignacion = Column(Date, default=datetime.date.today, nullable=False)
    fecha_fin = Column(Date, nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        CheckConstraint("fecha_fin IS NULL OR fecha_fin >= fecha_asignacion", name="chk_fechas_asignacion"),
    )

    cliente = relationship("Cliente", back_populates="asignaciones_entrenador")
    entrenador = relationship("Entrenador", back_populates="asignaciones_cliente")
