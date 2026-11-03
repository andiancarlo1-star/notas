# Control Escolar

Demo SaaS escolar con roles de administración, dirección, maestro y alumno; tareas, entrega de archivos, notas por actividad y cierre bimestral con tarjeta PDF.

## Configuración y ejecución segura

1. Copia `.env.example` a `.env` y genera contraseñas nuevas y aleatorias para la base de datos y `JWT_SECRET` (mínimo 32 caracteres para JWT y 24 para la base de datos).
2. Ejecuta `docker compose up --build`.
3. Abre `http://localhost:8080`.

La base se crea vacía. Para el primer administrador, genera un hash bcrypt desde `backend` con `node -e "require('bcryptjs').hash('TU_CLAVE_LARGA', 12).then(console.log)"` e inserta ese hash en `usuarios` con rol `admin`. No publiques el hash ni la contraseña.

## Demo local

Para cargar datos ficticios, usa un proyecto Docker separado: `docker compose -p notas-demo -f docker-compose.yml -f docker-compose.demo.yml up --build`. Esta configuración agrega `database/demo.sql`, cuyas cuentas tienen una contraseña pública de demostración. Úsala solo en tu equipo. El servicio de producción predeterminado no carga estas cuentas.

Video del flujo de administración y alumno: [Control Escolar — Demo](demo-video/Control-Escolar-Demo.webm).

## Flujo de demostración

1. Ingresa como administrador y crea grados, cuentas, alumnos, materias y asignaciones.
2. Crea un ciclo y sus cuatro bimestres mediante `POST /api/academico/ciclos` y `POST /api/academico/bimestres`.
3. Vincula cada cuenta de alumno: `PATCH /api/alumnos/:id/usuario` con `{ "usuario_id": id }`.
4. El maestro crea tareas con `bimestre_id`, `puntaje_maximo` y `ponderacion`.
5. El alumno entra al panel, adjunta PDF, DOCX, PPTX, PNG o JPG (máximo 10 MB) y entrega la tarea.
6. El maestro califica. Dirección cierra el bimestre con `POST /api/academico/bimestres/:id/cerrar`.
7. Descarga la tarjeta: `GET /api/academico/alumnos/:alumnoId/tarjeta.pdf?bimestre_id=:id`.

El cierre consolida las notas y bloquea las tareas del periodo. No se debe reabrir o modificar directamente la base de datos: para correcciones se debe crear un flujo de rectificación auditado.

## Seguridad y aislamiento de datos

La aplicación usa MySQL, que no implementa políticas RLS nativas. Por eso el backend aplica control de acceso por fila: cada consulta de maestro, alumno y administrador limita los registros al usuario, materia, tarea o grado autorizado. Las rutas de datos requieren JWT; las entregas se guardan fuera de la carpeta pública y se sirven solo después de comprobar el rol y la relación con la tarea. Revisa `SECURITY.md` para el alcance y las limitaciones.
