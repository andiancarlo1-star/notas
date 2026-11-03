# Seguridad

## Aislamiento de filas

Este proyecto usa MySQL 8.4, que no ofrece Row Level Security (RLS) nativo como PostgreSQL. El aislamiento se implementa en el backend y depende de que la API sea el único acceso de la aplicación a la base.

- Alumnos: las consultas de perfil, tareas, calificaciones y archivos se filtran por la cuenta vinculada.
- Maestros: tareas, notas, entregas y boletas se limitan a materias asignadas y tareas propias.
- Administración y dirección: pueden consultar los registros escolares dentro de sus rutas autorizadas.
- Las rutas de datos requieren JWT y comprueban el rol antes de ejecutar operaciones.

No expongas el puerto de MySQL a Internet ni entregues credenciales de base de datos a clientes. Para garantías RLS aplicadas directamente por la base de datos, migra a un motor que soporte políticas por fila o rediseña las operaciones con vistas y procedimientos almacenados.

## Archivos y secretos

- Los adjuntos se almacenan en un volumen privado. El endpoint de descarga comprueba que el alumno sea el titular, el maestro sea responsable de la tarea o el usuario tenga rol administrativo.
- El compose normal no carga cuentas predeterminadas. `docker-compose.demo.yml` carga datos ficticios solo para demos locales; su contraseña conocida nunca debe usarse en un servidor público.
- `.env` y archivos de entorno están excluidos de Git. Rota inmediatamente cualquier secreto que se haya publicado.
- En producción, configura secretos aleatorios propios para `JWT_SECRET`, `DB_PASSWORD` y `MYSQL_ROOT_PASSWORD`, TLS en el proxy y copias de seguridad cifradas.

## Hallazgos corregidos en esta revisión

- El dashboard estaba expuesto sin autenticación.
- Los alumnos podían consultar la boleta de otro grado; ahora el resultado se limita a su propio registro.
- Una ruta de calificación no definía el ID del maestro y la operación de nota antigua permitía puntajes fuera de rango o alumnos no asignados.
- Las notas de actualización masiva no validaban estado, rango ni asignación de alumnos.
- Los adjuntos se servían como archivos estáticos sin autorización; ahora se descargan tras verificar la relación del usuario con la entrega.
- Los registros de auditoría guardaban fragmentos de respuesta, potencialmente sensibles; ahora guardan solo metadatos de solicitud.
- Las credenciales demo estaban incluidas en la inicialización de todas las bases; ahora están en un archivo de demo local opcional.
