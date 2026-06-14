import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from src.database.connection import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    correo = Column(String(150), unique=True, index=True, nullable=False)
    telefono = Column(String(50), nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False)  # 'admin', 'entrenador', 'cliente'
    activo = Column(Boolean, default=True)
    fecha_registro = Column(Date, default=datetime.date.today)
    avatar = Column(String(255), nullable=True)

    # Relaciones de extensión
    cliente = relationship("Cliente", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    entrenador = relationship("Entrenador", back_populates="usuario", uselist=False, cascade="all, delete-orphan")


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
    objetivo = Column(String(150), nullable=False)
    peso = Column(Float, nullable=True)
    altura = Column(Float, nullable=True)

    # Relación uno-a-uno con Usuario
    usuario = relationship("Usuario", back_populates="cliente")

    # Relaciones
    asignaciones_entrenador = relationship("ClienteEntrenador", back_populates="cliente", cascade="all, delete-orphan")
    membresias_cliente = relationship("ClienteMembresia", back_populates="cliente", cascade="all, delete-orphan")
    pagos = relationship("Pago", back_populates="cliente", cascade="all, delete-orphan")
    asistencias = relationship("Asistencia", back_populates="cliente", cascade="all, delete-orphan")
    progresos = relationship("ProgresoCliente", back_populates="cliente", cascade="all, delete-orphan")
    rutinas = relationship("Rutina", back_populates="cliente", cascade="all, delete-orphan")


class Entrenador(Base):
    __tablename__ = "entrenadores"

    id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
    especialidad = Column(String(150), nullable=False)
    experiencia = Column(Integer, nullable=False)  # Años

    # Relación uno-a-uno con Usuario
    usuario = relationship("Usuario", back_populates="entrenador")

    # Relaciones
    asignaciones_cliente = relationship("ClienteEntrenador", back_populates="entrenador", cascade="all, delete-orphan")
    asistencias_registradas = relationship("Asistencia", back_populates="entrenador")
    rutinas_creadas = relationship("Rutina", back_populates="entrenador")


class ClienteEntrenador(Base):
    __tablename__ = "cliente_entrenador"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    entrenador_id = Column(Integer, ForeignKey("entrenadores.id", ondelete="CASCADE"), nullable=False)
    activo = Column(Boolean, default=True)
    fecha_asignacion = Column(Date, default=datetime.date.today)

    cliente = relationship("Cliente", back_populates="asignaciones_entrenador")
    entrenador = relationship("Entrenador", back_populates="asignaciones_cliente")


class Membresia(Base):
    __tablename__ = "membresias"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(100), nullable=False)  # 'Mensual Premium', 'Trimestral', etc.
    precio = Column(Float, nullable=False)
    duracion_meses = Column(Integer, nullable=False)
    activa = Column(Boolean, default=True)

    cliente_membresias = relationship("ClienteMembresia", back_populates="membresia", cascade="all, delete-orphan")


class ClienteMembresia(Base):
    __tablename__ = "cliente_membresias"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    membresia_id = Column(Integer, ForeignKey("membresias.id", ondelete="CASCADE"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    estado = Column(String(50), nullable=False)  # 'activa', 'vencida', 'pendiente', 'suspendida'

    cliente = relationship("Cliente", back_populates="membresias_cliente")
    membresia = relationship("Membresia", back_populates="cliente_membresias")


class Pago(Base):
    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    monto = Column(Float, nullable=False)
    fecha = Column(Date, default=datetime.date.today)
    concepto = Column(String(200), nullable=False)
    metodo = Column(String(50), nullable=False)  # 'efectivo', 'tarjeta', 'transferencia'
    estado = Column(String(50), nullable=False)  # 'pagado', 'pendiente', 'cancelado'
    comprobante = Column(String(255), nullable=True)

    cliente = relationship("Cliente", back_populates="pagos")


class Asistencia(Base):
    __tablename__ = "asistencias"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    entrenador_id = Column(Integer, ForeignKey("entrenadores.id", ondelete="SET NULL"), nullable=True)
    fecha = Column(Date, default=datetime.date.today)
    hora_entrada = Column(String(50), nullable=False)
    hora_salida = Column(String(50), nullable=True)
    duracion_minutos = Column(Integer, nullable=True)
    observaciones = Column(String(255), nullable=True)

    cliente = relationship("Cliente", back_populates="asistencias")
    entrenador = relationship("Entrenador", back_populates="asistencias_registradas")


class ProgresoCliente(Base):
    __tablename__ = "progreso_clientes"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    fecha = Column(Date, default=datetime.date.today)
    peso = Column(Float, nullable=False)
    altura = Column(Float, nullable=False)
    imc = Column(Float, nullable=False)
    porcentaje_grasa = Column(Float, nullable=True)
    porcentaje_muscular = Column(Float, nullable=True)
    notas = Column(String(255), nullable=True)

    cliente = relationship("Cliente", back_populates="progresos")


class Ejercicio(Base):
    __tablename__ = "ejercicios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(String(255), nullable=True)

    rutina_ejercicios = relationship("RutinaEjercicio", back_populates="ejercicio", cascade="all, delete-orphan")


class Rutina(Base):
    __tablename__ = "rutinas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    entrenador_id = Column(Integer, ForeignKey("entrenadores.id", ondelete="CASCADE"), nullable=False)
    dias_semana = Column(String(255), nullable=False)  # Comma-separated like "Lunes,Miércoles"
    nivel = Column(String(50), nullable=False)  # 'principiante', 'intermedio', 'avanzado'
    objetivo = Column(String(150), nullable=False)
    fecha_creacion = Column(Date, default=datetime.date.today)
    activa = Column(Boolean, default=True)
    descripcion = Column(String(255), nullable=True)

    cliente = relationship("Cliente", back_populates="rutinas")
    entrenador = relationship("Entrenador", back_populates="rutinas_creadas")
    ejercicios = relationship("RutinaEjercicio", back_populates="rutina", cascade="all, delete-orphan")


class RutinaEjercicio(Base):
    __tablename__ = "rutina_ejercicios"

    id = Column(Integer, primary_key=True, index=True)
    rutina_id = Column(Integer, ForeignKey("rutinas.id", ondelete="CASCADE"), nullable=False)
    ejercicio_id = Column(Integer, ForeignKey("ejercicios.id", ondelete="CASCADE"), nullable=False)
    series = Column(Integer, nullable=False)
    repeticiones = Column(String(50), nullable=False)
    descanso = Column(String(50), nullable=False)
    notas = Column(String(255), nullable=True)

    rutina = relationship("Rutina", back_populates="ejercicios")
    ejercicio = relationship("Ejercicio", back_populates="rutina_ejercicios")
