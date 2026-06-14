# AGENTS.md - Reglas de desarrollo frontend GleyforGym

## Rol del asistente

Eres un experto en TypeScript, Angular 21 y desarrollo de aplicaciones web escalables. Debes escribir código funcional, limpio, mantenible, organizado, responsive y alineado a buenas prácticas de Angular.

## Objetivo del frontend

Desarrollar y refactorizar el frontend del sistema web GleyforGym, orientado a la gestión de un gimnasio. El sistema debe contar con vistas para administrador, entrenador y cliente, manteniendo una estructura modular, clara y funcional.

## Estructura obligatoria del proyecto

El proyecto debe mantener la siguiente estructura:

* `src/app/components/`: componentes visuales del sistema.
* `src/app/models/`: interfaces TypeScript para estructurar datos.
* `src/app/services/`: servicios para manejo de datos simulados y futura conexión con backend.
* `src/app/app.routes.ts`: configuración de rutas.
* `src/styles.css`: estilos globales.

No crear carpeta `pages`.

## Buenas prácticas de TypeScript

* Usar tipado estricto.
* Evitar el uso de `any`.
* Usar interfaces en `models`.
* Preferir nombres claros y descriptivos.
* Eliminar imports, variables y funciones no utilizadas.
* Mantener lógica compleja en archivos `.ts`, no en HTML.

## Buenas prácticas de Angular 21

* Usar componentes standalone.
* Usar `signal()` para estado local.
* Usar `computed()` para valores derivados y validaciones.
* Usar `inject()` para inyección de dependencias.
* Usar servicios para datos simulados.
* Mantener componentes pequeños, claros y reutilizables.
* Configurar rutas limpias y ordenadas.

## Formularios con signals

Los formularios deben manejarse con signals y validaciones computadas cuando corresponda.

Ejemplo base:

```ts
public loginModel = signal<LoginData>({
  correo: '',
  password: ''
});

public correoTocado = signal(false);
public passwordTocado = signal(false);

public correoError = computed(() => {
  const valor = this.loginModel().correo.trim();

  if (!valor) {
    return 'El correo electrónico es obligatorio.';
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(valor)) {
    return 'Ingrese un correo electrónico válido.';
  }

  return null;
});

public passwordError = computed(() => {
  const valor = this.loginModel().password;

  if (!valor) {
    return 'La contraseña es obligatoria.';
  }

  if (valor.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }

  return null;
});

public formularioValido = computed(() => {
  return !this.correoError() && !this.passwordError();
});
```

## Validaciones obligatorias

Los formularios deben validar:

* Campos obligatorios.
* Correo electrónico válido.
* Contraseña mínima de 8 caracteres.
* Confirmación de contraseña.
* Números positivos para precios, montos, duración, peso e IMC.
* Teléfono con formato válido.
* Mensajes de error en español.

## Servicios

Los datos simulados deben estar en servicios, no directamente en componentes.

Ejemplos de métodos:

* `obtenerUsuarios()`
* `obtenerClientes()`
* `obtenerMembresias()`
* `obtenerPagos()`
* `obtenerAsistencias()`
* `obtenerRutinas()`
* `obtenerProgreso()`

Los servicios deben quedar preparados para futura conexión con API REST en FastAPI.

## Diseño visual obligatorio

Mantener la identidad visual de GleyforGym:

* Fondo oscuro.
* Color principal naranja `#ff6600`.
* Texto blanco.
* Tarjetas oscuras.
* Tablas oscuras.
* Botones naranjas.
* Bordes redondeados.
* Diseño moderno fitness.
* Todo el contenido en español.
* No usar palabras en inglés en la interfaz.

## Responsividad

El sistema debe ser responsive:

* Adaptado a escritorio, tablet y móvil.
* Usar `container-fluid`, `row`, `col`, `col-md`, `col-lg`, `d-flex`, `flex-wrap`.
* Las tablas deben usar diseño responsive o scroll horizontal.
* Las tarjetas deben reorganizarse en pantallas pequeñas.
* El menú lateral debe adaptarse correctamente en móvil.

## Menús por rol

### Administrador

* Panel Principal
* Usuarios
* Clientes
* Membresías
* Pagos
* Asistencia
* Rutinas
* Mi Perfil
* Configuración
* Cerrar Sesión

### Entrenador

* Panel Principal
* Clientes Asignados
* Asistencia
* Rutinas
* Mi Perfil
* Configuración
* Cerrar Sesión

### Cliente

* Panel Principal
* Mi Perfil
* Mi Membresía
* Mis Pagos
* Mi Asistencia
* Mis Rutinas
* Configuración
* Cerrar Sesión

La opción activa debe resaltarse en naranja.

## Criterio de calidad esperado

El frontend debe cumplir con:

* Funcionalidad correcta.
* Angular 21+.
* Signal forms.
* Validaciones.
* Modularización.
* Organización de componentes, modelos y servicios.
* Diseño responsive.
* Código limpio y mantenible.
